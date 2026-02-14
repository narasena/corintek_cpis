# Log-Sheet Module Refactoring Plan

Stabilize and de-risk the log-sheet codebase (~5,499 LOC, 24 files) without breaking existing functionality. Late rescue mode — no architecture changes, no new packages.

---

## Refactoring Order Rationale

> **LOW risk → MEDIUM risk → HIGH risk**
>
> Start with leaf modules that have zero or few dependents. Each successful step builds confidence and reduces the surface area before touching god files.

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

## Phase 3: Extract from God Component — `[logSheetId]/page.tsx` (est. ~60 min)

The 1,166-line page.tsx. Strategy: **extract sections into child components** without changing behavior.

### Step 3.1: Extract `LogSheetToolbar` component (15 min)

- Lines ~235–290 (header bar with back button, title, mode toggle, save/print/submit/approve buttons)
- **[NEW]** [log-sheet-toolbar.tsx](<file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/app/(main)/log-sheets/[projectId]/[logSheetId]/components/log-sheet-toolbar.tsx>)
- Props: `mode`, `status`, `isPending`, `onSave`, `onPrint`, `onSubmit`, `onApprove`, `onModeToggle`, `projectId`, `projectName`, `logSheetDate`
- **[MODIFY]** A7 `page.tsx` — replace toolbar JSX with `<LogSheetToolbar ... />`

### Step 3.2: Extract `MachineSelectionPanel` component (15 min)

- Lines ~300–400 (chiller/CT toggle sections)
- **[NEW]** [machine-selection-panel.tsx](<file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/app/(main)/log-sheets/[projectId]/[logSheetId]/components/machine-selection-panel.tsx>)
- Props: `machines`, `activeChillerIds`, `activeCTIds`, `onToggle`, `onSelectAll`, `onClear`, `disabled`
- **[MODIFY]** A7 `page.tsx` — replace machine selection JSX

### Step 3.3: Extract `DesktopEntryTable` component (20 min)

- Lines ~450–900 (the category loop with 3 rendering paths)
- **[NEW]** [desktop-entry-table.tsx](<file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/app/(main)/log-sheets/[projectId]/[logSheetId]/components/desktop-entry-table.tsx>)
- Props: `parametersByCategory`, `machinesForCategory`, `entryState`, `setEntryState`, `disabled`
- Contains the 3 rendering paths (COOLING_WATER_QUALITY, general with machines, general without)
- **[MODIFY]** A7 `page.tsx` — replace desktop table JSX

### Step 3.4: Extract `MobileStickyBar` component (10 min)

- Lines ~1140–1164 (bottom action bar on mobile)
- **[NEW]** [mobile-sticky-bar.tsx](<file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/app/(main)/log-sheets/[projectId]/[logSheetId]/components/mobile-sticky-bar.tsx>)
- **[MODIFY]** A7 `page.tsx` — replace sticky bar JSX

### Expected result after Phase 3

`page.tsx` should shrink from **1,166** to **~250–300 lines** — pure orchestration of hooks + child components.

---

## Phase 4: Split `service.ts` God Module (est. ~45 min)

1,011 lines → split into focused sub-modules. Strategy: **group by domain concern**.

### Step 4.1: Extract `log-sheet-entries.service.ts` (15 min)

- Move `upsertLogSheetEntries` (L801–887)
- **[NEW]** [log-sheet-entries.service.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/log-sheet-entries.service.ts)
- **[MODIFY]** `service.ts` — remove function, re-export from new file
- **[MODIFY]** `actions.ts` — if importing directly, update path

### Step 4.2: Extract `log-sheet-photos.service.ts` (10 min)

- Move `upsertLogSheetPhotos` (L889–949)
- **[NEW]** [log-sheet-photos.service.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/log-sheet-photos.service.ts)

### Step 4.3: Extract `log-sheet-chemicals.service.ts` (10 min)

- Move `upsertLogSheetChemicalUsages` (L951–1010)
- **[NEW]** [log-sheet-chemicals.service.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/log-sheet-chemicals.service.ts)

### Step 4.4: Extract `log-sheet-validation.service.ts` (10 min)

- Move `validateLogSheetForSubmission` (L640–673) and `validateLogSheetForApproval` (L675–799)
- **[NEW]** [log-sheet-validation.service.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/log-sheet-validation.service.ts)
- Move shared helpers: `isEntryComplete` (L19–44)

### Expected result after Phase 4

`service.ts` shrinks from **1,011** to **~450 lines** — CRUD + detail fetching only.

### Facade pattern (preserve imports)

In `service.ts`, add re-exports so existing imports don't break:

```ts
export { upsertLogSheetEntries } from './log-sheet-entries.service';
export { upsertLogSheetPhotos } from './log-sheet-photos.service';
// ...
```

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

|   Phase   | What                     |       Files Changed       |  Est. Time   |  Risk  |
| :-------: | ------------------------ | :-----------------------: | :----------: | :----: |
|     1     | Tests + quick wins       |    +4 new, 1 modified     |    45 min    | 🟢 LOW |
|     2     | Deduplicate code         |    +2 new, 6 modified     |    40 min    | 🟢 LOW |
|     3     | Split god component (A7) |    +4 new, 1 modified     |    60 min    | 🟡 MED |
|     4     | Split god module (F2)    |    +4 new, 2 modified     |    45 min    | 🟡 MED |
|     5     | Type cleanup + verify    |        2 modified         |    20 min    | 🟢 LOW |
| **Total** |                          | **+14 new, ~12 modified** | **~3.5 hrs** |        |

### Expected post-refactor metrics

| Metric               | Before | After (est.) |         Δ          |
| -------------------- | -----: | -----------: | :----------------: |
| Max file LOC         |  1,166 |         ~300 |      **-74%**      |
| Files >500 LOC       |      4 |  1 (preview) |      **-75%**      |
| Methods >50 LOC      |     14 |           ~6 |      **-57%**      |
| Duplicated blocks    |     10 |           ~2 |      **-80%**      |
| Cross-layer coupling |      1 |            0 |     **-100%**      |
| Total files          |     24 |          ~38 | +14 (smaller each) |
| Total LOC            |  5,499 |       ~5,300 |    -4% (dedup)     |

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
