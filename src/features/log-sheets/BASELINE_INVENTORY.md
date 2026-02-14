# Log-Sheets Module — Baseline Inventory

> Snapshot: 2026-02-14 | Measure improvement against these numbers.

---

## 1. Summary Dashboard

| Metric                                |                                     Value |
| ------------------------------------- | ----------------------------------------: |
| Total Lines of Code                   |                                 **5,499** |
| Code Files (.ts/.tsx)                 |                                    **24** |
| Largest File                          | **1,166 lines** (`[logSheetId]/page.tsx`) |
| Files >500 lines                      |                                     **4** |
| Methods >50 lines                     |                                    **14** |
| Exported Functions/Types              |                                   **~60** |
| TODO/FIXME/HACK Comments              |                                     **0** |
| Estimated Total Cyclomatic Complexity |                                  **~148** |

---

## 2. Lines of Code by File (sorted ascending)

| #   | File                                                       |     Lines |
| --- | ---------------------------------------------------------- | --------: |
| 1   | `hooks/use-log-sheet-technicians.ts`                       |        18 |
| 2   | `components/project-columns.tsx`                           |        28 |
| 3   | `hooks/use-log-sheet-detail-data.ts`                       |        34 |
| 4   | `components/log-sheet-dialog.tsx`                          |        34 |
| 5   | `features/log-sheets/utils.ts`                             |        37 |
| 6   | `page.tsx` (root)                                          |        62 |
| 7   | `[logSheetId]/utils.ts`                                    |        66 |
| 8   | `[projectId]/components/columns.tsx`                       |        74 |
| 9   | `features/log-sheets/components/log-sheet-header.tsx`      |        74 |
| 10  | `hooks/use-log-sheet-draft-state.ts`                       |        92 |
| 11  | `hooks/use-log-sheet-active-machines.ts`                   |       104 |
| 12  | `[logSheetId]/types.ts`                                    |       105 |
| 13  | `hooks/use-log-sheet-derived.ts`                           |       107 |
| 14  | `[projectId]/page.tsx`                                     |       135 |
| 15  | `hooks/use-log-sheet-draft-saver.ts`                       |       143 |
| 16  | `features/log-sheets/types.ts`                             |       185 |
| 17  | `[projectId]/components/log-sheet-form.tsx`                |       194 |
| 18  | `components/mobile-entry-card.tsx`                         |       200 |
| 19  | `hooks/use-log-sheet-validation.ts`                        |       201 |
| 20  | `components/chemical-usage-section.tsx`                    |       210 |
| 21  | **`features/log-sheets/actions.ts`**                       |   **508** |
| 22  | **`features/log-sheets/components/log-sheet-preview.tsx`** |   **712** |
| 23  | **`features/log-sheets/service.ts`**                       | **1,010** |
| 24  | **`[logSheetId]/page.tsx`**                                | **1,166** |

---

## 3. Largest Files (>500 lines)

| File                    | Lines | Functions | Description                                     |
| ----------------------- | ----: | :-------: | ----------------------------------------------- |
| `[logSheetId]/page.tsx` | 1,166 |     5     | God component — detail page with ~930 lines JSX |
| `service.ts`            | 1,010 |    20     | God module — all Prisma CRUD + validation       |
| `log-sheet-preview.tsx` |   712 |     6     | Print preview — single monolithic render        |
| `actions.ts`            |   508 |    17     | Server action hub — 14 exported actions         |

**These 4 files = 3,396 lines (62% of total codebase)**

---

## 4. Longest Methods (>50 lines)

| #   | File                                    | Method                             |     Lines | Range                |
| --- | --------------------------------------- | ---------------------------------- | --------: | -------------------- |
| 1   | `[logSheetId]/page.tsx`                 | `LogSheetDetailPage` (render body) | **1,111** | L56–L1166            |
| 2   | `log-sheet-preview.tsx`                 | `LogSheetPreview`                  |   **583** | L130–L712            |
| 3   | `service.ts`                            | `getLogSheetDetail`                |   **222** | L417–L638            |
| 4   | `hooks/use-log-sheet-validation.ts`     | `useLogSheetValidation`            |   **196** | L6–L201              |
| 5   | `components/chemical-usage-section.tsx` | `ChemicalUsageSection`             |   **169** | L42–L210             |
| 6   | `components/mobile-entry-card.tsx`      | `MobileEntryCard`                  |   **178** | L23–L200             |
| 7   | `hooks/use-log-sheet-draft-saver.ts`    | `useLogSheetDraftSaver`            |   **130** | L14–L143             |
| 8   | `service.ts`                            | `validateLogSheetForApproval`      |   **125** | L675–L799            |
| 9   | `service.ts`                            | `upsertLogSheetEntries`            |    **87** | L801–L887            |
| 10  | `service.ts`                            | `updateLogSheetStatus`             |    **71** | L336–L406            |
| 11  | `actions.ts`                            | `uploadLogSheetImageAction`        |    **65** | L444–L508            |
| 12  | `service.ts`                            | `upsertLogSheetPhotos`             |    **61** | L889–L949            |
| 13  | `service.ts`                            | `upsertLogSheetChemicalUsages`     |    **60** | L951–L1010           |
| 14  | `service.ts`                            | `upsertLogSheetMachines`           |    **52** | L202–L243 (adjusted) |

---

## 5. Estimated Cyclomatic Complexity

> Estimated by counting decision points: `if`, `else`, `switch/case`, `for`, `while`, `&&`/`||` guards, ternary `?:`, `catch`, and callback branches.

| File                           |     Est. CC | Hotspots                                                                                                                                                                                       |
| ------------------------------ | ----------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[logSheetId]/page.tsx`        |     **~35** | Mode branching, category loops, 3 value-type ternaries × N machines, status-based button visibility                                                                                            |
| `service.ts`                   |     **~38** | `getLogSheetDetail` (complex query mapping), `validateLogSheetForApproval` (multi-step validation), `updateLogSheetStatus` (state machine), upsert loops with conditional create/update/delete |
| `log-sheet-preview.tsx`        |     **~22** | Category iteration, machine-type branching, value formatting conditionals, photo/chemical rendering                                                                                            |
| `actions.ts`                   |     **~18** | Zod parse + error branching per action, RBAC checks, upload error handling                                                                                                                     |
| `use-log-sheet-validation.ts`  |     **~15** | Chiller/CT loops with per-parameter emptiness checks, category-specific rules                                                                                                                  |
| `use-log-sheet-draft-saver.ts` |      **~8** | Sequential action calls with error branching                                                                                                                                                   |
| `mobile-entry-card.tsx`        |      **~6** | Value-type ternary (BOOLEAN/NUMBER/TEXT), machine loop                                                                                                                                         |
| `chemical-usage-section.tsx`   |      **~5** | Add/remove handlers, existing-check branch                                                                                                                                                     |
| Remaining 16 files             | **~1 each** | Minimal branching                                                                                                                                                                              |
| **TOTAL**                      |    **~148** | —                                                                                                                                                                                              |

### CC Distribution

|       CC Range       | Count |  %  |
| :------------------: | :---: | :-: |
|     1–5 (simple)     |  16   | 67% |
|   6–10 (moderate)    |   3   | 12% |
|   11–20 (complex)    |   3   | 12% |
| 21–40 (very complex) |   2   | 8%  |
| **>40 (untestable)** | **0** | 0%  |

---

## 6. TODO / FIXME / HACK Comments

```
Total found: 0
```

No technical debt markers exist. Note: 2 `console.log` statements with `[CPIS-VALIDATION]` prefix exist in `use-log-sheet-validation.ts` (L96, L137) — likely debug remnants.

---

## 7. Baseline Snapshot (for future comparison)

```
┌──────────────────────────────┬──────────┐
│ Metric                       │ Baseline │
├──────────────────────────────┼──────────┤
│ Total LOC                    │    5,499 │
│ File count                   │       24 │
│ Files >500 LOC               │        4 │
│ Methods >50 LOC              │       14 │
│ Max file size                │    1,166 │
│ Max method size              │    1,111 │
│ Total cyclomatic complexity  │     ~148 │
│ Avg CC per file              │     ~6.2 │
│ TODO/FIXME count             │        0 │
│ Duplicated code blocks       │       10 │
│ God classes (>300 LOC)       │        2 │
│ Circular dependencies        │        0 │
└──────────────────────────────┴──────────┘
```

---

_Use this document as the pre-refactor baseline. After each refactoring pass, re-measure and compare against Section 7._
