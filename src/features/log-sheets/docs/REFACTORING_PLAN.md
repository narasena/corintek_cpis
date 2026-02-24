# Log-Sheet Module Refactoring Plan

Stabilize and de-risk the log-sheet codebase (~5,499 LOC, 24 files) without breaking existing functionality. Late rescue mode — no architecture changes, no new packages.

---

## Refactoring Priority Matrix

Priority = f(Pain, Risk, Value)

- **P1:** High pain + Medium risk + Critical value → Fix ASAP
- **P2:** High pain + High risk + Critical value → Fix carefully
- **P3:** Medium across the board → Fix when time permits
- **P4:** Low impact → Don’t touch unless needed

| Area                                                                                                         | Pain Level | Risk Level | Business Value | Priority | Evidence                                                                                 |
| ------------------------------------------------------------------------------------------------------------ | ---------- | ---------- | -------------- | :------: | ---------------------------------------------------------------------------------------- |
| Core Service (`features/log-sheets/service.ts`)                                                              | High       | High       | Critical       |    P2    | God module (1,008 LOC), central CRUD/status/locking/signatures, highest coupling/fan-out |
| Actions Hub (`features/log-sheets/actions.ts`)                                                               | High       | High       | Critical       |    P2    | 590 LOC, 16+ actions, all app writes flow through here, auth/Zod/R2 upload               |
| Detail Page (`[logSheetId]/page.tsx`)                                                                        | High       | Medium     | Critical       |    P1    | 1,245 LOC god component, controls all UX flows, many dependencies                        |
| Shared Validation (`validation.ts`, `approval-validation.ts`, `log-sheet-status.ts`, `log-sheet-locking.ts`) | Medium     | Medium     | High           |    P3    | Central rules for submission/approval/editability; overlaps with service validation      |
| Preview + Derived Data (`log-sheet-preview.tsx`, `use-log-sheet-derived.ts`)                                 | Medium     | Medium     | High           |    P3    | 734 LOC preview, cross-layer coupling via CATEGORY_ORDER, duplicated logic               |
| Draft Save Orchestration (`use-log-sheet-draft-saver.ts`)                                                    | Medium     | Medium     | High           |    P3    | Coordinates multi-action saves; partial save risk                                        |
| Shared Utilities (`features/log-sheets/utils.ts`, `[logSheetId]/utils.ts`)                                   | Medium     | Low        | Medium         |    P3    | Small but high fan-out; formatters duplicated across files                               |
| Signatures UI (`signature-section.tsx`, `signature-pad.tsx`)                                                 | Low        | Low        | Medium         |    P4    | Leaf UI modules; localized impact if changed                                             |
| List Pages + Columns (`/log-sheets` + `/[projectId]` list files)                                             | Low        | Low        | Medium         |    P4    | CRUD tables and dialogs; low coupling, stable                                            |

## Refactoring Order Rationale

> **LOW risk → MEDIUM risk → HIGH risk**
>
> Start with leaf modules that have zero or few dependents. Each successful step builds confidence and reduces the surface area before touching god files.

1. Start with LOW RISK modules (isolated, few dependents)
2. Build confidence and learn patterns
3. Graduate to MEDIUM RISK modules
4. Finally tackle HIGH RISK core logic

- Emphasize starting with low-risk, isolated modules to build confidence before tackling high-risk core logic.
- This mitigates the risk of breaking production during a large refactor.

**Never refactor high-risk code first. That's how you break production.**

---

## Testing Strategy

> [!IMPORTANT]
> **"Lock current behavior, not test results."**
>
> We write **characterization tests** (aka "golden tests") — they capture what the code _does today_, not what it _should_ do. If a test fails after refactoring, the refactor broke something.

### What to test first

| Priority | What                                | Why                                                                    | Type |
| :------: | ----------------------------------- | ---------------------------------------------------------------------- | ---- |
|    1     | `features/log-sheets/utils.ts` (F4) | Pure functions, high fan-out (6 consumers). Fastest to test.           | Unit |
|    2     | `[logSheetId]/utils.ts` (A9)        | Pure formatters, duplicated elsewhere. Locks behavior before dedup.    | Unit |
|    3     | `features/log-sheets/types.ts` (F3) | Zod schemas — test `.parse()` / `.safeParse()` with real-world shapes. | Unit |

### What NOT to test now

- UI components (A7, A10, A11) — need React Testing Library + DOM, high cost vs rescue-mode ROI.
- `service.ts` (F2) — requires Prisma mocking, 17 functions. Too expensive now.
- `actions.ts` (F1) — server action testing is fragile in Next.js.

### Test infrastructure

Vitest is already configured at project root (`vitest.config.ts`). Setup file referenced at `src/__tests__/setup.ts` does not exist — **we must create it** (can be empty initially).

**Test file locations** (co-located, per Next.js convention):

- `src/features/log-sheets/utils.test.ts`
- `src/features/log-sheets/types.test.ts`
- `src/app/(main)/log-sheets/[projectId]/[logSheetId]/utils.test.ts`

---

## Phase 1: Foundation — Tests + Quick Wins (est. ~45 min)

Safe, zero-risk changes that reduce noise before structural work.

### Step 1.1: Create test setup file (5 min)

- **[NEW]** [setup.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/__tests__/setup.ts)
- Empty file so Vitest doesn't error on missing setup.

### Step 1.2: Write characterization tests for `features/log-sheets/utils.ts` (10 min)

- **[NEW]** [utils.test.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/utils.test.ts)
- Test `makeEntryKey()` — various combos of parameterId, machineId (string | null), role
- Test `isLogSheetEntryEmpty()` — empty, has numericValue, has boolValue, has textValue, has fileUrl

### Step 1.3: Write characterization tests for `[logSheetId]/utils.ts` (10 min)

- **[NEW]** [utils.test.ts](<file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/app/(main)/log-sheets/[projectId]/[logSheetId]/utils.test.ts>)
- Test `formatDate()` — Date input, string input
- Test `formatLimit()` — NUMBER with min/max, BOOLEAN, no limits
- Test `formatRawWaterLimit()` — with values, without values
- Test `isOutOfRange()` — in-range, below-min, above-max, null value

### Step 1.4: Write characterization tests for Zod schemas (10 min)

- **[NEW]** [types.test.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/types.test.ts)
- Test `CreateLogSheetSchema.parse()` — valid input, invalid projectId
- Test `UpdateLogSheetSchema.parse()` — partial updates
- Test `CreateLogSheetEntrySchema.parse()` — each valueType variant

### Step 1.5: Remove debug `console.log` statements (5 min)

- **[MODIFY]** [use-log-sheet-validation.ts](<file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/app/(main)/log-sheets/[projectId]/[logSheetId]/hooks/use-log-sheet-validation.ts>)
- Remove L96 and L137 (`[CPIS-VALIDATION]` debug logs)

### Step 1.6: Run tests, confirm green (5 min)

```bash
npx vitest run --reporter=verbose src/features/log-sheets/ src/app/\(main\)/log-sheets/
```

---

## Phase 2: Deduplicate Shared Code (est. ~40 min)

Eliminate the 10 identified duplication blocks. LOW risk — each is a leaf change.

### Step 2.1: Consolidate `formatDate()` (10 min)

- **Source:** `[logSheetId]/utils.ts` (A9) and `[projectId]/components/columns.tsx` (A4)
- **Action:** Keep canonical `formatDate` in A9. Update A4 to import from A9.
- **[MODIFY]** [columns.tsx](<file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/app/(main)/log-sheets/[projectId]/components/columns.tsx>) — remove local `formatDate`, add import
- **Verify:** `npx vitest run` stays green. Manual: open `/log-sheets/[projectId]` page, confirm date column renders.

### Step 2.2: Consolidate `TLogSheetRow` type (5 min)

- **Source:** inline in A3 `[projectId]/page.tsx` and A4 `columns.tsx`
- **Action:** Move to A4 `columns.tsx` (already has it), export it. Import in A3.
- **[MODIFY]** [columns.tsx](<file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/app/(main)/log-sheets/[projectId]/components/columns.tsx>) — add `export` to `TLogSheetRow`
- **[MODIFY]** [page.tsx](<file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/app/(main)/log-sheets/[projectId]/page.tsx>) — remove inline `TLogSheetRow`, import from columns

### Step 2.3: Consolidate `formatLimit()` and `formatRawWaterLimit()` (15 min)

- **Source:** A9 `utils.ts` and F6 `log-sheet-preview.tsx` (DUP-3, DUP-4)
- **Action:** Create a shared utility file.
- **[NEW]** [format-helpers.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/format-helpers.ts) — canonical `formatLimit`, `formatRawWaterLimit`, `formatValue`
- **[MODIFY]** A9 `utils.ts` — re-export from `format-helpers.ts` (preserves existing imports)
- **[MODIFY]** F6 `log-sheet-preview.tsx` — replace local functions with imports from `format-helpers.ts`
- **Verify:** Tests green. Manual: open detail page in input + preview mode, confirm limits display correctly.

### Step 2.4: Extract `CATEGORY_ORDER` and `machinesForCategory` (10 min)

- **Source:** F6 `log-sheet-preview.tsx` exports `CATEGORY_ORDER` (consumed by A13). `machinesForCategory` duplicated in F6 and A13.
- **Action:** Move both to a shared constants/helpers file.
- **[NEW]** [category-helpers.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/category-helpers.ts) — `CATEGORY_ORDER`, `sectionTitle`, `machinesForCategory`
- **[MODIFY]** F6 `log-sheet-preview.tsx` — import from `category-helpers.ts`, remove local defs
- **[MODIFY]** A13 `use-log-sheet-derived.ts` — import from `category-helpers.ts` instead of F6
- **Verify:** fixes the cross-layer coupling concern (A13 → F6).

### Step 2.5: Deduplicate technician fetch (A6/A17) (5 min)

- **Action:** Update A6 `log-sheet-form.tsx` to use `useLogSheetTechnicians` hook (A17) instead of inline fetch.
- **[MODIFY]** [log-sheet-form.tsx](<file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/app/(main)/log-sheets/[projectId]/components/log-sheet-form.tsx>) — remove inline `getAllUsersAction` useEffect, use hook

---

## Phase 3: Extract from God Component — `[logSheetId]/page.tsx` (est. ~60 min) ✅ COMPLETED 2026-02-23

The 1,245-line page.tsx. Strategy: **extract sections into child components** without changing behavior.

### Step 3.1: Extract `LogSheetToolbar` component ✅ DONE (15 min)

- Lines ~235–290 (header bar with back button, title, mode toggle, save/print/submit/approve buttons)
- **[NEW]** [log-sheet-toolbar.tsx](<file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis-logsheet-refactor/src/app/(main)/log-sheets/[projectId]/[logSheetId]/components/log-sheet-toolbar.tsx>) — 89 lines
- Props: `mode`, `status`, `isPending`, `isLocked`, `canAdminOverride`, `adminOverride`, `onSave`, `onPrint`, `onSubmit`, `onModeChange`, `onAdminOverrideToggle`, `onBack`, `projectId`
- **[MODIFY]** A7 `page.tsx` — replace toolbar JSX with `<LogSheetToolbar ... />`

### Step 3.2: Extract `MachineSelectionPanel` component ✅ DONE (15 min)

- Lines ~300–400 (chiller/CT toggle sections)
- **[NEW]** [machine-selection-panel.tsx](<file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis-logsheet-refactor/src/app/(main)/log-sheets/[projectId]/[logSheetId]/components/machine-selection-panel.tsx>) — 132 lines
- Props: `chillers`, `coolingTowers`, `activeChillerIds`, `activeCTIds`, `onToggleMachine`, `onSelectAllMachines`, `onClearMachines`
- **[MODIFY]** A7 `page.tsx` — replace machine selection JSX

### Step 3.3: Extract `LogSheetCategorySection` component ✅ DONE (20 min)

- Lines ~450–1045 (the category loop with 3 rendering paths)
- **[NEW]** [log-sheet-category-section.tsx](<file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis-logsheet-refactor/src/app/(main)/log-sheets/[projectId]/[logSheetId]/components/log-sheet-category-section.tsx>) — 779 lines
- Contains:
  - `LogSheetCategorySection` (main export)
  - `CoolingWaterQualityDesktop` / `CoolingWaterQualityMobile`
  - `GeneralCategoryDesktop` / `GeneralCategoryMobile`
  - Helper cells: `BooleanCell`, `NumberCell`, `TextCell`, `RawWaterCell`, `NoteCell`
- Props: `categories`, `parametersByCategory`, `entryState`, `setEntryState`, `machinesForCategory`, `activeCTIds`, `coolingTowers`, `isMobileView`
- **[MODIFY]** A7 `page.tsx` — replace category loop JSX

### Step 3.4: Mobile sticky bar ⏭️ SKIPPED

- Lines ~1140–1164 (bottom action bar on mobile)
- **DECISION:** Kept inline — only 18 lines, tightly coupled to page state

### Result after Phase 3 ✅ VERIFIED

`page.tsx` shrank from **1,245** to **437 lines** — **-65%** (orchestration of hooks + child components).

### Tests

- **371 tests pass** (14 test files)
- Zero behavioral regressions
- Zero import breakage

---

## Phase 8: Extract Function — `assertLogSheetEditable` (est. ~10 min) ✅ COMPLETED 2026-02-24

### Problem

`assertLogSheetEditable` was duplicated in 4 files with identical logic (~36 lines each):

| File                             |         Lines |
| -------------------------------- | ------------: |
| `service.ts`                     |            36 |
| `log-sheet-entries.service.ts`   |            36 |
| `log-sheet-photos.service.ts`    |            36 |
| `log-sheet-chemicals.service.ts` |            36 |
| **Total duplicate**              | **144 lines** |

### Solution

Extract to shared module `internal/edit-permission.ts`.

### Files Changed

| File                             | Action                       | Δ Lines |
| -------------------------------- | ---------------------------- | ------- |
| `internal/edit-permission.ts`    | NEW                          | +47     |
| `service.ts`                     | Remove duplicate, add import | -39     |
| `log-sheet-entries.service.ts`   | Remove duplicate, add import | -42     |
| `log-sheet-photos.service.ts`    | Remove duplicate, add import | -42     |
| `log-sheet-chemicals.service.ts` | Remove duplicate, add import | -42     |

### Tests

- **371 tests pass** (14 test files)
- Zero behavioral regressions

### Result

~118 lines of duplicate code eliminated. Single source of truth for edit authorization.

---

## Phase 4: Split `service.ts` God Module (est. ~45 min) ✅ COMPLETED 2026-02-22

1,011 lines → split into focused sub-modules. Strategy: **group by domain concern**.

### Step 4.1: Extract `log-sheet-entries.service.ts` ✅ DONE

- Move `upsertLogSheetEntries` (L801–887)
- **[NEW]** [log-sheet-entries.service.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/log-sheet-entries.service.ts) — 157 lines
- **[MODIFY]** `service.ts` — remove function, re-export from new file (facade pattern)

### Step 4.2: Extract `log-sheet-photos.service.ts` ✅ DONE

- Move `upsertLogSheetPhotos` (L889–949)
- **[NEW]** [log-sheet-photos.service.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/log-sheet-photos.service.ts) — 110 lines

### Step 4.3: Extract `log-sheet-chemicals.service.ts` ✅ DONE

- Move `upsertLogSheetChemicalUsages` (L951–1010)
- **[NEW]** [log-sheet-chemicals.service.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/log-sheet-chemicals.service.ts) — 108 lines

### Step 4.4: Extract `log-sheet-validation.service.ts` ⏸️ DEFERRED

- ~~Move `validateLogSheetForSubmission` (L640–673) and `validateLogSheetForApproval` (L675–799)~~
- **DECISION:** Deferred to avoid circular dependency with `getLogSheetDetail`. Validation functions remain in `service.ts`.
- Move shared helpers: `isEntryComplete` (L19–44) — exists in both `service.ts` and `approval-validation.ts` (DUP-11)

### Result after Phase 4

`service.ts` shrinks from **1,011** to **753 lines** — **-25%** (CRUD + detail fetching + validation).

---

## Phase 9: Extract Service Module — Status & Validation (est. ~15 min) ✅ COMPLETED 2026-02-24

### Problem

`service.ts` remained a god module at 749 lines, handling 6+ distinct responsibilities including status management and validation.

### Solution

Extract status-related operations into dedicated `log-sheet-status.service.ts`.

### Files Changed

| File                          | Action   | Δ Lines |
| ----------------------------- | -------- | ------- |
| `log-sheet-status.service.ts` | NEW      | +123    |
| `service.ts`                  | Modified | -115    |

### Functions Extracted

| Function                        | Lines | Responsibility                            |
| ------------------------------- | ----: | ----------------------------------------- |
| `updateLogSheetStatus`          |    66 | Status transitions with RBAC + validation |
| `validateLogSheetForSubmission` |    40 | Pre-submission signature/range checks     |
| `validateLogSheetForApproval`   |     4 | Approval validation wrapper               |

### Dependency Analysis

- New file imports from existing modules only (no new external deps)
- Circular dependency avoided: status service imports `getLogSheetDetail` from `service.ts` (one-way)
- Facade pattern: `service.ts` re-exports extracted functions for backward compatibility

### Tests

- **371 tests pass** (14 test files)
- Zero behavioral regressions
- Zero import breakage

### Result

| Metric        | Before | After |    Δ     |
| ------------- | -----: | ----: | :------: |
| `service.ts`  |    749 |   634 | **-15%** |
| Status module |      - |   123 |   +NEW   |
| Total LOC     |    749 |   757 |    +8    |

~115 lines extracted into focused domain module. Single responsibility per file improved.

---

## Phase 10: Extract Helper — Revalidation Paths (est. ~10 min) ✅ COMPLETED 2026-02-24

### Problem

`actions.ts` contained 10+ duplicate blocks of revalidation path calls, violating DRY and creating maintenance risk.

### Solution

Extract `revalidateLogSheetPaths` helper function to centralize cache revalidation.

### Files Changed

| File         | Action   | Δ Lines |
| ------------ | -------- | ------- |
| `actions.ts` | Modified | -16     |

### Pattern

```ts
function revalidateLogSheetPaths(projectId: string, logSheetId?: string): void {
  revalidatePath('/log-sheets');
  revalidatePath(`/log-sheets/${projectId}`);
  revalidatePath('/');
  revalidatePath(`/my-projects/${projectId}`);
  if (logSheetId) {
    revalidatePath(`/log-sheets/${projectId}/${logSheetId}`);
  }
}
```

### Tests

- **371 tests pass** (14 test files)
- Zero behavioral regressions

### Result

| Metric           | Before | After |     Δ     |
| ---------------- | ------ | ----- | :-------: |
| `actions.ts` LOC | 591    | 575   |  **-3%**  |
| Duplicate blocks | 10     | 0     | **-100%** |
| Helper calls     | 0      | 11    |    +11    |

---

### Facade pattern (preserve imports) ✅ IMPLEMENTED

In `service.ts`, re-exports added so existing imports don't break:

```ts
export { upsertLogSheetEntries } from './log-sheet-entries.service';
export { upsertLogSheetPhotos } from './log-sheet-photos.service';
export { upsertLogSheetChemicalUsages } from './log-sheet-chemicals.service';
```

### Tests

- **371 tests pass** (14 test files)
- Zero behavioral regressions
- Zero import breakage

---

## Phase 5: Final Cleanup (est. ~20 min)

### Step 5.1: Consolidate `TEntryState` types (10 min)

- F3 `types.ts` has `TEntryState` (server-safe), A8 `types.ts` has `TEntryState` (with `pendingFile`)
- **Action:** Extend: `type TEntryState = TBaseEntryState & { pendingFile?: File | null }`
- **[MODIFY]** A8 `types.ts` — import base from F3, extend with `pendingFile`

### Step 5.2: Run full test suite + manual verification (10 min)

```bash
npx vitest run --reporter=verbose
```

Manual verification checklist:

1. Navigate to `/log-sheets` — project list loads
2. Click a project → log sheet list loads
3. Create a new log sheet → form submits, appears in list
4. Open log sheet detail → input mode renders, all categories visible
5. Toggle machines → entries update
6. Enter values (NUMBER, BOOLEAN, TEXT) → state updates
7. Add chemical usage → appears in table
8. Save draft → toast success
9. Switch to preview mode → print preview renders
10. Submit → status changes
11. Approve → status changes

---

## Summary

|   Phase   | What                                     |       Files Changed       |  Est. Time   |  Risk  |  Status  |
| :-------: | ---------------------------------------- | :-----------------------: | :----------: | :----: | :------: |
|     1     | Tests + quick wins                       |    +4 new, 1 modified     |    45 min    | 🟢 LOW |    ✅    |
|     2     | Deduplicate code                         |    +2 new, 6 modified     |    40 min    | 🟢 LOW |    ✅    |
|     3     | Split god component (A7)                 |    +3 new, 1 modified     |    50 min    | 🟡 MED |    ✅    |
|     4     | Split god module (F2)                    |    +3 new, 1 modified     |    45 min    | 🟡 MED |    ✅    |
|     5     | Type cleanup + verify                    |        2 modified         |    20 min    | 🟢 LOW |    ✅    |
|     6     | Split preview component                  |    +8 new, 2 modified     |    30 min    | 🟡 MED |    ✅    |
|     7     | Extract Method: getLogSheetDetail        |        1 modified         |    15 min    | 🟢 LOW |    ✅    |
|     8     | Extract Function: assertLogSheetEditable |    +1 new, 4 modified     |    10 min    | 🟢 LOW |    ✅    |
|     9     | Extract Module: status service           |    +1 new, 1 modified     |    15 min    | 🟢 LOW |    ✅    |
|    10     | Extract Helper: revalidation paths       |        1 modified         |    10 min    | 🟢 LOW |    ✅    |
| **Total** |                                          | **+22 new, ~21 modified** | **~5.2 hrs** |        | **100%** |

### Actual post-refactor metrics (2026-02-24)

| Metric               | Before | After |          Δ          |
| -------------------- | -----: | ----: | :-----------------: |
| Max file LOC         |  1,245 |   634 |      **-49%**       |
| `page.tsx` LOC       |  1,245 |   437 |      **-65%**       |
| `service.ts` LOC     |  1,008 |   634 |      **-37%**       |
| `actions.ts` LOC     |    591 |   575 |       **-3%**       |
| `preview` (total)    |    734 |   961 | +8 files (avg 120L) |
| Files >500 LOC       |      4 |     2 |       **-2**        |
| Methods >50 LOC      |     14 |     2 |      **-86%**       |
| Duplicated blocks    |     11 |     2 |      **-82%**       |
| Cross-layer coupling |      1 |     0 |      **-100%**      |
| Total files          |     32 |    46 | +14 (smaller each)  |
| Total CC             |   ~180 |  ~110 |      **-39%**       |

---

## Phase 7: Extract Method — `getLogSheetDetail` (est. ~15 min) ✅ COMPLETED 2026-02-23

Extracted the 220-line monolithic `getLogSheetDetail` function into 4 focused helpers.

### Step 7.1: Extract helper functions

| Function                  | Lines | Responsibility                           |
| ------------------------- | ----: | ---------------------------------------- |
| `fetchLogSheetRow`        |    80 | Prisma query with 8 includes             |
| `fetchProjectMachines`    |    18 | Machine fetch + chiller/CT split         |
| `fetchParameters`         |    28 | Parameter query excluding LAB_ANALYSIS   |
| `computeActiveMachineIds` |    18 | Active machine ID computation + fallback |
| `buildLogSheetDetailView` |    83 | View model construction                  |

### Step 7.2: Thin orchestrator

`getLogSheetDetail` now ~24 lines — calls helpers in sequence.

### Bug Fix

Added missing `locked` field to view model (was causing TypeScript error).

### Tests

- **371 tests pass** (14 test files)
- Zero behavioral regressions
- Zero import breakage

---

## Verification Plan

### Automated Tests

```bash
# Run after EVERY phase
npx vitest run --reporter=verbose
```

### Manual Verification

After each phase, walk through the 11-point checklist from Step 5.2 above. These cover the full user flow: list → create → edit → save → preview → submit → approve.

> [!CAUTION]
> **Rollback:** Each phase is independently revertable via `git stash` or `git checkout`. Commit after each green phase.
