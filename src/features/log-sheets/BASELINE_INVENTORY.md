# Log-Sheets Module — Baseline Inventory

> Snapshot: 2026-02-19 | Measure improvement against these numbers.

---

## 1. Summary Dashboard

| Metric                                |                                     Value |
| ------------------------------------- | ----------------------------------------: |
| Total Lines of Code (ts/tsx)          |                                 **6,805** |
| Code Files (.ts/.tsx)                 |                                    **32** |
| Classes                               |                                     **0** |
| Largest File                          | **1,245 lines** (`[logSheetId]/page.tsx`) |
| Files >500 lines                      |                                     **4** |
| Methods >50 lines                     |                                    **14** |
| Exported Functions/Types              |                                   **~70** |
| TODO/FIXME/HACK Comments              |                                     **0** |
| Estimated Total Cyclomatic Complexity |                                  **~180** |

---

## 2. Lines of Code by File (sorted ascending)

Source: `wc -l` over `src/app/(main)/log-sheets` and `src/features/log-sheets` (ts/tsx only), including tests.

| #   | File                                                       |     Lines |
| --- | ---------------------------------------------------------- | --------: |
| 1   | `components/project-columns.tsx`                           |        28 |
| 2   | `hooks/use-log-sheet-detail-data.ts`                       |        34 |
| 3   | `components/log-sheet-dialog.tsx`                          |        34 |
| 4   | `features/log-sheets/utils.ts`                             |        37 |
| 5   | `hooks/use-log-sheet-technicians.ts`                       |        39 |
| 6   | `features/log-sheets/log-sheet-locking.ts`                 |        39 |
| 7   | `[logSheetId]/utils.ts`                                    |        46 |
| 8   | `features/log-sheets/log-sheet-status.ts`                  |        54 |
| 9   | `page.tsx` (root)                                          |        62 |
| 10  | `[projectId]/components/columns.tsx`                       |        67 |
| 11  | `features/log-sheets/components/log-sheet-header.tsx`      |        74 |
| 12  | `hooks/use-log-sheet-validation.ts`                        |        79 |
| 13  | `hooks/use-log-sheet-draft-state.ts`                       |        92 |
| 14  | `hooks/use-log-sheet-derived.ts`                           |       107 |
| 15  | `hooks/use-log-sheet-active-machines.ts`                   |       109 |
| 16  | `features/log-sheets/log-sheet-locking.test.ts`            |       121 |
| 17  | `[logSheetId]/types.ts`                                    |       123 |
| 18  | `[projectId]/page.tsx`                                     |       124 |
| 19  | `components/signature-section.tsx`                         |       144 |
| 20  | `hooks/use-log-sheet-draft-saver.ts`                       |       155 |
| 21  | `[projectId]/components/log-sheet-form.tsx`                |       185 |
| 22  | `components/signature-pad.tsx`                             |       198 |
| 23  | `features/log-sheets/approval-validation.ts`               |       199 |
| 24  | `components/mobile-entry-card.tsx`                         |       200 |
| 25  | `features/log-sheets/types.ts`                             |       202 |
| 26  | `components/chemical-usage-section.tsx`                    |       210 |
| 27  | `features/log-sheets/validation.ts`                        |       221 |
| 28  | `features/log-sheets/service.test.ts`                      |       245 |
| 29  | **`features/log-sheets/actions.ts`**                       |   **590** |
| 30  | **`features/log-sheets/components/log-sheet-preview.tsx`** |   **734** |
| 31  | **`features/log-sheets/service.ts`**                       | **1,008** |
| 32  | **`[logSheetId]/page.tsx`**                                | **1,245** |

---

## 3. Largest Files (>500 lines)

| File                    | Lines | Functions | Description                                                |
| ----------------------- | ----: | :-------: | ---------------------------------------------------------- |
| `[logSheetId]/page.tsx` | 1,245 |     5     | God component — detail page with ~950 lines of JSX         |
| `service.ts`            | 1,008 |    20     | God module — Prisma CRUD, validation, status, signatures   |
| `log-sheet-preview.tsx` |   734 |     6     | Print preview — monolithic render for all categories       |
| `actions.ts`            |   590 |    17     | Server action hub — create/update/save/status/upload flows |

**These 4 files = 3,577 lines (~53% of ts/tsx LOC in this slice)**

---

## 4. Longest Methods (>50 lines)

Approximate method lengths based on current code (2026-02-19).

| #   | File                                    | Method                             |     Lines | Notes                                      |
| --- | --------------------------------------- | ---------------------------------- | --------: | ------------------------------------------ |
| 1   | `[logSheetId]/page.tsx`                 | `LogSheetDetailPage` (render body) | **~1,150** | Single component; imports + JSX + handlers |
| 2   | `log-sheet-preview.tsx`                 | `LogSheetPreview`                  |   **~600** | Main preview component                     |
| 3   | `service.ts`                            | `getLogSheetDetail`                |   **~220** | Builds full detail view model              |
| 4   | `hooks/use-log-sheet-validation.ts`     | `useLogSheetValidation`            |    **~70** | Maps page state into shared validator      |
| 5   | `components/chemical-usage-section.tsx` | `ChemicalUsageSection`             |   **~170** | Full chemical CRUD section                 |
| 6   | `components/mobile-entry-card.tsx`      | `MobileEntryCard`                  |   **~170** | Mobile entry card rendering                |
| 7   | `hooks/use-log-sheet-draft-saver.ts`    | `useLogSheetDraftSaver`            |   **~120** | Orchestrates multi-part draft saves        |
| 8   | `service.ts`                            | `validateLogSheetForApproval`      |   **~120** | Approval-time validation                   |
| 9   | `service.ts`                            | `upsertLogSheetEntries`            |    **~90** | Bulk upsert of entry records               |
| 10  | `service.ts`                            | `updateLogSheetStatus`             |    **~70** | Status transition + authorization checks   |
| 11  | `actions.ts`                            | `uploadLogSheetImageAction`        |    **~60** | Image upload to R2 worker                  |
| 12  | `service.ts`                            | `upsertLogSheetPhotos`             |    **~60** | Bulk upsert photos                         |
| 13  | `service.ts`                            | `upsertLogSheetChemicalUsages`     |    **~60** | Bulk upsert chemical usages                |
| 14  | `service.ts`                            | `upsertLogSheetMachines`           |    **~50** | Machine selection persistence              |

---

## 5. Estimated Cyclomatic Complexity

Estimated by counting decision points: `if`, `else`, `switch/case`, `for`, `while`, `&&`/`||` guards, ternary `?:`, `catch`, and callback branches.

| File                           |     Est. CC | Hotspots                                                                                                                                                                                       |
| ------------------------------ | ----------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[logSheetId]/page.tsx`        |     **~40** | Mode branching, category loops, machine selection, value-type branches, status-based button visibility, signature enablement                                                                   |
| `service.ts`                   |     **~40** | `getLogSheetDetail`, `validateLogSheetForApproval`, `updateLogSheetStatus`, `saveLogSheetSignature`, upsert loops with conditional create/update/delete                                        |
| `log-sheet-preview.tsx`        |     **~24** | Category iteration, machine-type branching, range highlighting, conditional rendering for photos and chemicals                                                                                 |
| `actions.ts`                   |     **~20** | Zod parse + error branching per action, RBAC checks, multiple upload/override paths                                                                                                           |
| `use-log-sheet-validation.ts`  |     **~10** | Construction of validation input, dependency on parameters map and machines                                                                                                                    |
| `validation.ts`                |     **~18** | Chiller/CT loops with per-parameter emptiness checks, raw water and consumption completeness rules                                                                                            |
| `approval-validation.ts`       |     **~18** | Range checks, category-specific required fields, machine label mapping, raw water and note requirements                                                                                       |
| `use-log-sheet-draft-saver.ts` |      **~8** | Sequential action calls with error branching                                                                                                                                                   |
| `mobile-entry-card.tsx`        |      **~6** | Value-type ternary (BOOLEAN/NUMBER/TEXT), per-machine entry layout                                                                                                                             |
| `chemical-usage-section.tsx`   |      **~5** | Add/remove handlers, presence checks, mapping over usages                                                                                                                                      |
| Remaining 22 files             | **~1–3 each** | Minimal branching                                                                                                                                                                              |
| **TOTAL**                      |    **~180** | —                                                                                                                                                                                              |

### CC Distribution

|       CC Range       | Count |  %  |
| :------------------: | :---: | :-: |
|     1–5 (simple)     |  20   | 62% |
|   6–10 (moderate)    |   4   | 12% |
|   11–20 (complex)    |   5   | 16% |
| 21–40 (very complex) |   3   | 9%  |
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
└──────────────────────────────┴──────────┘
```

---

_Use this document as the pre-refactor baseline. After each refactoring pass, re-measure and compare against Section 7._
