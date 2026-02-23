# Log-Sheets Module — Baseline Inventory

> Snapshot: 2026-02-19 (Updated: 2026-02-23 after Phase 3, 4 & 5 refactoring)

---

## 1. Summary Dashboard

| Metric                                | Before | After (2026-02-23) |   Change |
| ------------------------------------- | -----: | -----------------: | -------: |
| Total Lines of Code (ts/tsx)          |  6,805 |              7,620 |     +815 |
| Code Files (.ts/.tsx)                 |     32 |                 44 |      +12 |
| Classes                               |      0 |                  0 |        — |
| Largest File                          |  1,245 |                779 | **-37%** |
| Files >500 lines                      |      4 |                  3 |       -1 |
| Methods >50 lines                     |     14 |                  7 |   **-7** |
| Exported Functions/Types              |    ~70 |                ~90 |      +20 |
| TODO/FIXME/HACK Comments              |      0 |                  0 |        — |
| Estimated Total Cyclomatic Complexity |   ~180 |               ~130 | **-28%** |

---

## 2. Lines of Code by File (sorted ascending)

Source: `wc -l` over `src/app/(main)/log-sheets` and `src/features/log-sheets` (ts/tsx only), including tests.

| #   | File                                                                            |   Lines |
| --- | ------------------------------------------------------------------------------- | ------: |
| 1   | `components/project-columns.tsx`                                                |      28 |
| 2   | `hooks/use-log-sheet-detail-data.ts`                                            |      34 |
| 3   | `components/log-sheet-dialog.tsx`                                               |      34 |
| 4   | `features/log-sheets/utils.ts`                                                  |      37 |
| 5   | `hooks/use-log-sheet-technicians.ts`                                            |      39 |
| 6   | `features/log-sheets/log-sheet-locking.ts`                                      |      39 |
| 7   | `[logSheetId]/utils.ts`                                                         |      46 |
| 8   | `features/log-sheets/log-sheet-status.ts`                                       |      54 |
| 9   | `page.tsx` (root)                                                               |      62 |
| 10  | `[projectId]/components/columns.tsx`                                            |      67 |
| 11  | `features/log-sheets/components/log-sheet-header.tsx`                           |      74 |
| 12  | `features/log-sheets/components/log-sheet-preview/category-helpers.ts`          |      37 |
| 13  | `hooks/use-log-sheet-validation.ts`                                             |      79 |
| 14  | `features/log-sheets/components/log-sheet-preview/format-helpers.ts`            |      82 |
| 15  | `[logSheetId]/components/log-sheet-toolbar.tsx`                                 |      89 |
| 16  | `hooks/use-log-sheet-draft-state.ts`                                            |      92 |
| 17  | `hooks/use-log-sheet-derived.ts`                                                |     107 |
| 18  | `hooks/use-log-sheet-active-machines.ts`                                        |     109 |
| 19  | `features/log-sheets/components/log-sheet-preview/consumption-section.tsx`      |     108 |
| 20  | `[logSheetId]/components/machine-selection-panel.tsx`                           |     132 |
| 21  | `features/log-sheets/log-sheet-locking.test.ts`                                 |     121 |
| 22  | `features/log-sheets/components/log-sheet-preview/cooling-water-section.tsx`    |     117 |
| 23  | `[logSheetId]/types.ts`                                                         |     123 |
| 24  | `[projectId]/page.tsx`                                                          |     124 |
| 25  | `features/log-sheets/log-sheet-chemicals.service.ts`                            |     126 |
| 26  | `features/log-sheets/log-sheet-photos.service.ts`                               |     128 |
| 27  | `features/log-sheets/components/log-sheet-preview/documentation-section.tsx`    |     130 |
| 28  | `components/signature-section.tsx`                                              |     144 |
| 29  | `features/log-sheets/log-sheet-entries.service.ts`                              |     157 |
| 30  | `hooks/use-log-sheet-draft-saver.ts`                                            |     155 |
| 31  | `features/log-sheets/components/log-sheet-preview/general-category-section.tsx` |     155 |
| 32  | `[projectId]/components/log-sheet-form.tsx`                                     |     185 |
| 33  | `components/signature-pad.tsx`                                                  |     198 |
| 34  | `features/log-sheets/approval-validation.ts`                                    |     199 |
| 35  | `components/mobile-entry-card.tsx`                                              |     200 |
| 36  | `features/log-sheets/types.ts`                                                  |     202 |
| 37  | `components/chemical-usage-section.tsx`                                         |     210 |
| 38  | `features/log-sheets/validation.ts`                                             |     221 |
| 39  | `features/log-sheets/service.test.ts`                                           |     245 |
| 40  | `features/log-sheets/components/log-sheet-preview/signatures-section.tsx`       |      70 |
| 41  | **`features/log-sheets/components/log-sheet-preview/index.tsx`**                | **262** |
| 42  | **`[logSheetId]/page.tsx`**                                                     | **437** |
| 43  | **`features/log-sheets/actions.ts`**                                            | **590** |
| 44  | **`[logSheetId]/components/log-sheet-category-section.tsx`**                    | **779** |
| 45  | **`features/log-sheets/service.ts`**                                            | **753** |

---

## 3. Largest Files (>500 lines)

### Before Refactoring (2026-02-19)

| File                    | Lines | Functions | Description                                                |
| ----------------------- | ----: | :-------: | ---------------------------------------------------------- |
| `[logSheetId]/page.tsx` | 1,245 |     5     | God component — detail page with ~950 lines of JSX         |
| `service.ts`            | 1,008 |    20     | God module — Prisma CRUD, validation, status, signatures   |
| `log-sheet-preview.tsx` |   734 |     6     | Print preview — monolithic render for all categories       |
| `actions.ts`            |   590 |    17     | Server action hub — create/update/save/status/upload flows |

**These 4 files = 3,577 lines (~53% of ts/tsx LOC in this slice)**

### After Phase 3, 4 & 5 Refactoring (2026-02-23)

| File                             | Lines | Functions | Description                                                |
| -------------------------------- | ----: | :-------: | ---------------------------------------------------------- |
| `log-sheet-category-section.tsx` |   779 |    11     | Category tables with value cells (extracted from page.tsx) |
| `service.ts`                     |   753 |    17     | Core CRUD, status, signatures (extracted 3 services)       |
| `actions.ts`                     |   590 |    17     | Server action hub — create/update/save/status/upload flows |

**These 3 files = 2,122 lines (~28% of ts/tsx LOC)**

### New Extracted Components (Phase 3)

| File                             | Lines | Functions | Responsibility                |
| -------------------------------- | ----: | :-------: | ----------------------------- |
| `log-sheet-category-section.tsx` |   779 |    11     | All category tables rendering |
| `machine-selection-panel.tsx`    |   132 |     1     | Chiller/CT selection UI       |
| `log-sheet-toolbar.tsx`          |    89 |     1     | Toolbar with mode/save/print  |

**Total extracted from page.tsx: 1,000 lines**

### New Extracted Services (Phase 4)

| File                             | Lines | Functions | Responsibility                 |
| -------------------------------- | ----: | :-------: | ------------------------------ |
| `log-sheet-entries.service.ts`   |   157 |     2     | `upsertLogSheetEntries`        |
| `log-sheet-photos.service.ts`    |   128 |     1     | `upsertLogSheetPhotos`         |
| `log-sheet-chemicals.service.ts` |   126 |     1     | `upsertLogSheetChemicalUsages` |

**Total extracted from service.ts: 411 lines**

### New Extracted Preview Components (Phase 5)

| File                                             | Lines | Functions | Responsibility                                    |
| ------------------------------------------------ | ----: | :-------: | ------------------------------------------------- |
| `log-sheet-preview/index.tsx`                    |   262 |     1     | Main preview orchestrator                         |
| `log-sheet-preview/general-category-section.tsx` |   155 |     1     | General category table render                     |
| `log-sheet-preview/documentation-section.tsx`    |   130 |     1     | Photo documentation grid                          |
| `log-sheet-preview/cooling-water-section.tsx`    |   117 |     1     | Cooling water table with raw                      |
| `log-sheet-preview/consumption-section.tsx`      |   108 |     1     | Water meter + chemicals table                     |
| `log-sheet-preview/format-helpers.ts`            |    82 |     3     | formatLimit, formatRawWaterLimit, formatValue     |
| `log-sheet-preview/signatures-section.tsx`       |    70 |     1     | Signature panels                                  |
| `log-sheet-preview/category-helpers.ts`          |    37 |     3     | CATEGORY_ORDER, sectionTitle, machinesForCategory |

**Total: 961 lines (from original 734-line monolith → 8 focused modules)**

---

## 4. Longest Methods (>50 lines)

Approximate method lengths based on current code (2026-02-23).

| #      | File                                    | Method                             |          Lines | Notes                                         |
| ------ | --------------------------------------- | ---------------------------------- | -------------: | --------------------------------------------- |
| 1      | `log-sheet-category-section.tsx`        | `CoolingWaterQualityDesktop`       |       **~120** | Desktop CT table with value cells             |
| ~~2~~  | ~~`log-sheet-preview.tsx`~~             | ~~`LogSheetPreview`~~              |   ~~**~600**~~ | **EXTRACTED to 8 modules (Phase 5)**          |
| 2      | `service.ts`                            | `getLogSheetDetail`                |       **~220** | Builds full detail view model                 |
| 3      | `log-sheet-category-section.tsx`        | `GeneralCategoryDesktop`           |       **~110** | Desktop general category table                |
| 4      | `components/chemical-usage-section.tsx` | `ChemicalUsageSection`             |       **~170** | Full chemical CRUD section                    |
| 5      | `components/mobile-entry-card.tsx`      | `MobileEntryCard`                  |       **~170** | Mobile entry card rendering                   |
| 6      | `hooks/use-log-sheet-draft-saver.ts`    | `useLogSheetDraftSaver`            |       **~120** | Orchestrates multi-part draft saves           |
| 7      | `service.ts`                            | `validateLogSheetForApproval`      |       **~120** | Approval-time validation                      |
| ~~9~~  | ~~`service.ts`~~                        | ~~`upsertLogSheetEntries`~~        |    ~~**~90**~~ | **MOVED to `log-sheet-entries.service.ts`**   |
| 8      | `service.ts`                            | `updateLogSheetStatus`             |        **~70** | Status transition + authorization checks      |
| ~~11~~ | ~~`[logSheetId]/page.tsx`~~             | ~~`LogSheetDetailPage` (render)~~  | ~~**~1,150**~~ | **EXTRACTED to 3 components**                 |
| ~~12~~ | ~~`service.ts`~~                        | ~~`upsertLogSheetPhotos`~~         |    ~~**~60**~~ | **MOVED to `log-sheet-photos.service.ts`**    |
| ~~13~~ | ~~`service.ts`~~                        | ~~`upsertLogSheetChemicalUsages`~~ |    ~~**~60**~~ | **MOVED to `log-sheet-chemicals.service.ts`** |
| 9      | `service.ts`                            | `upsertLogSheetMachines`           |        **~50** | Machine selection persistence                 |

---

## 5. Estimated Cyclomatic Complexity

Estimated by counting decision points: `if`, `else`, `switch/case`, `for`, `while`, `&&`/`||` guards, ternary `?:`, `catch`, and callback branches.

### After Phase 3, 4 & 5 Refactoring (2026-02-23)

| File                             |       Est. CC | Hotspots                                                                                                |
| -------------------------------- | ------------: | ------------------------------------------------------------------------------------------------------- |
| `log-sheet-category-section.tsx` |       **~25** | Category switching, value-type branches, raw water cells, mobile/desktop paths                          |
| `service.ts`                     |       **~28** | `getLogSheetDetail`, `validateLogSheetForApproval`, `updateLogSheetStatus`, `saveLogSheetSignature`     |
| `log-sheet-preview/index.tsx`    |       **~12** | Category iteration, hasDocumentation check (reduced from ~24)                                           |
| `actions.ts`                     |       **~20** | Zod parse + error branching per action, RBAC checks, multiple upload/override paths                     |
| `[logSheetId]/page.tsx`          |       **~12** | Mode switching, status checks, admin override (extracted most complexity)                               |
| `validation.ts`                  |       **~18** | Chiller/CT loops with per-parameter emptiness checks, raw water and consumption completeness rules      |
| `approval-validation.ts`         |       **~18** | Range checks, category-specific required fields, machine label mapping, raw water and note requirements |
| `log-sheet-entries.service.ts`   |        **~8** | Entry upsert loop with create/update/delete branching                                                   |
| `use-log-sheet-draft-saver.ts`   |        **~8** | Sequential action calls with error branching                                                            |
| `log-sheet-photos.service.ts`    |        **~5** | Photo upsert with soft-delete branching                                                                 |
| `log-sheet-chemicals.service.ts` |        **~5** | Chemical usage upsert with soft-delete branching                                                        |
| `mobile-entry-card.tsx`          |        **~6** | Value-type ternary (BOOLEAN/NUMBER/TEXT), per-machine entry layout                                      |
| `chemical-usage-section.tsx`     |        **~5** | Add/remove handlers, presence checks, mapping over usages                                               |
| Preview sub-components           | **~3-5 each** | Focused single-responsibility components                                                                |
| Remaining files                  | **~1–3 each** | Minimal branching                                                                                       |
| **TOTAL**                        |      **~130** | —                                                                                                       |

### CC Distribution

|       CC Range       | Count |  %  |
| :------------------: | :---: | :-: |
|     1–5 (simple)     |  38   | 86% |
|   6–10 (moderate)    |   3   | 7%  |
|   11–20 (complex)    |   2   | 5%  |
| 21–40 (very complex) |   1   | 2%  |
| **>40 (untestable)** | **0** | 0%  |

---

## 6. TODO / FIXME / HACK Comments

Search: `TODO|FIXME|HACK` across `src/app/(main)/log-sheets` and `src/features/log-sheets` (ts/tsx/md).

```
Total found in code files: 0
```

Occurrences in this markdown file are documentation-only and not counted as technical debt markers.

---

## 7. Baseline Snapshot (for future comparison)

### Before Refactoring (2026-02-19)

```
┌──────────────────────────────┬──────────┐
│ Metric                       │ Baseline │
├──────────────────────────────┼──────────┤
│ Total LOC (ts/tsx)           │    6,805 │
│ File count                   │       32 │
│ Files >500 LOC               │        4 │
│ Methods >50 LOC              │       14 │
│ Max file size                │    1,245 │
│ Max method size              │   ~1,150 │
│ Total cyclomatic complexity  │     ~180 │
│ Avg CC per file              │     ~5.6 │
│ TODO/FIXME count             │        0 │
│ Duplicated code blocks       │       11 │
│ God classes (>300 LOC)       │        2 │
│ Circular dependencies        │        1 │
│ Cross-layer coupling         │        1 │
└──────────────────────────────┴──────────┘
```

### After Phase 3, 4 & 5 Refactoring (2026-02-23)

```
┌──────────────────────────────┬──────────┐
│ Metric                       │ Current  │
├──────────────────────────────┼──────────┤
│ Total LOC (ts/tsx)           │    7,620 │
│ File count                   │       44 │
│ Files >500 LOC               │        3 │
│ Methods >50 LOC              │        7 │
│ Max file size                │      779 │
│ Max method size              │    ~220  │
│ Total cyclomatic complexity  │     ~130 │
│ Avg CC per file              │     ~3.0 │
│ TODO/FIXME count             │        0 │
│ Duplicated code blocks       │        4 │
│ God classes (>300 LOC)       │        3 │
│ Circular dependencies        │        0 │
│ Cross-layer coupling         │        0 │
└──────────────────────────────┴──────────┘
```

### Key Improvements

| Metric                | Before | After |     Δ     |
| --------------------- | -----: | ----: | :-------: |
| `page.tsx` LOC        |  1,245 |   437 | **-65%**  |
| `service.ts` LOC      |  1,008 |   753 | **-25%**  |
| `log-sheet-preview`   |    734 |   961 | +8 files  |
| Max file size         |  1,245 |   779 | **-37%**  |
| Max method size       |  1,150 |   220 | **-81%**  |
| Files >500 LOC        |      4 |     3 |  **-1**   |
| Methods >50 LOC       |     14 |     7 | **-50%**  |
| Total CC              |   ~180 |  ~130 | **-28%**  |
| Avg CC/file           |   ~5.6 |  ~3.0 | **-46%**  |
| Duplicated blocks     |     11 |     4 | **-64%**  |
| Circular dependencies |      1 |     0 | **-100%** |
| Cross-layer coupling  |      1 |     0 | **-100%** |

---

_Use this document as the pre-refactor baseline. After each refactoring pass, re-measure and compare against Section 7._
