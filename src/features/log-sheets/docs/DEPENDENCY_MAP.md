# Log-Sheets Module — Dependency Map

> Generated: 2026-02-19 | Updated: 2026-02-23 (Phase 3, 4 & 5 refactoring)

---

## 1. File Inventory (38 runtime modules + tests/docs)

### App Layer (`src/app/(main)/log-sheets/`)

| #   | File                                                                 |   Lines | Role                                     |
| --- | -------------------------------------------------------------------- | ------: | ---------------------------------------- |
| A1  | `page.tsx`                                                           |      63 | Root page — project list                 |
| A2  | `components/project-columns.tsx`                                     |      29 | Column defs for project table            |
| A3  | `[projectId]/page.tsx`                                               |     136 | Log-sheet list per project               |
| A4  | `[projectId]/components/columns.tsx`                                 |      75 | Column defs for log-sheet table          |
| A5  | `[projectId]/components/log-sheet-dialog.tsx`                        |      35 | CrudDialog wrapper for create            |
| A6  | `[projectId]/components/log-sheet-form.tsx`                          |     160 | Create log-sheet form                    |
| A7  | `[projectId]/[logSheetId]/page.tsx`                                  | **437** | Detail page (input + preview + signing)  |
| A8  | `[projectId]/[logSheetId]/types.ts`                                  |     106 | Local types for detail page              |
| A9  | `[projectId]/[logSheetId]/utils.ts`                                  |      67 | Local formatters/helpers                 |
| A10 | `[projectId]/[logSheetId]/components/chemical-usage-section.tsx`     |     211 | Chemical usage CRUD section              |
| A11 | `[projectId]/[logSheetId]/components/mobile-entry-card.tsx`          |     201 | Mobile-responsive entry card             |
| A12 | `[projectId]/[logSheetId]/components/log-sheet-toolbar.tsx`          |      89 | Toolbar with mode/save/print             |
| A13 | `[projectId]/[logSheetId]/components/machine-selection-panel.tsx`    |     132 | Chiller/CT selection UI                  |
| A14 | `[projectId]/[logSheetId]/components/log-sheet-category-section.tsx` | **779** | Category tables rendering                |
| A15 | `[projectId]/[logSheetId]/hooks/use-log-sheet-active-machines.ts`    |     105 | Toggle/select/clear machines             |
| A16 | `[projectId]/[logSheetId]/hooks/use-log-sheet-derived.ts`            |     107 | Categories, machines, computed           |
| A17 | `[projectId]/[logSheetId]/hooks/use-log-sheet-detail-data.ts`        |      35 | Fetch log-sheet detail                   |
| A18 | `[projectId]/[logSheetId]/hooks/use-log-sheet-draft-saver.ts`        |     144 | Save draft (entries, chemicals, uploads) |
| A19 | `[projectId]/[logSheetId]/hooks/use-log-sheet-draft-state.ts`        |      93 | Initialize draft state from detail       |
| A20 | `[projectId]/[logSheetId]/hooks/use-log-sheet-technicians.ts`        |      19 | Fetch all users as technicians           |
| A21 | `[projectId]/[logSheetId]/hooks/use-log-sheet-validation.ts`         |      79 | Client-side validation wrapper           |

### Features Layer — Runtime (`src/features/log-sheets/`)

| #   | File                                        |   Lines | Role                                                    |
| --- | ------------------------------------------- | ------: | ------------------------------------------------------- |
| F1  | `actions.ts`                                | **590** | Server actions (CRUD, status, signatures, upload)       |
| F2  | `service.ts`                                | **753** | Prisma service layer + auth/locking (reduced 25%)       |
| F2a | `log-sheet-entries.service.ts`              |     157 | `upsertLogSheetEntries` (extracted)                     |
| F2b | `log-sheet-photos.service.ts`               |     128 | `upsertLogSheetPhotos` (extracted)                      |
| F2c | `log-sheet-chemicals.service.ts`            |     126 | `upsertLogSheetChemicalUsages` (extracted)              |
| F3  | `types.ts`                                  |     200 | Zod schemas + interfaces                                |
| F4  | `utils.ts`                                  |      38 | `makeEntryKey`, `isLogSheetEntryEmpty`                  |
| F5  | `components/log-sheet-header.tsx`           |      75 | Print header component                                  |
| F6  | `components/log-sheet-preview/` (directory) |     961 | Print preview modules (Phase 5 extraction)              |
| F6a | `  index.tsx`                               |     262 | Main preview orchestrator                               |
| F6b | `  category-helpers.ts`                     |      37 | `CATEGORY_ORDER`, `sectionTitle`, `machinesForCategory` |
| F6c | `  format-helpers.ts`                       |      82 | `formatLimit`, `formatRawWaterLimit`, `formatValue`     |
| F6d | `  consumption-section.tsx`                 |     108 | Water meter + chemicals table                           |
| F6e | `  cooling-water-section.tsx`               |     117 | Cooling water table with raw water columns              |
| F6f | `  general-category-section.tsx`            |     155 | General category table render                           |
| F6g | `  signatures-section.tsx`                  |      70 | Signature panels                                        |
| F6h | `  documentation-section.tsx`               |     130 | Photo documentation grid                                |
| F7  | `components/signature-section.tsx`          |     144 | Signature UI for technician / client PIC                |
| F8  | `components/signature-pad.tsx`              |     197 | Canvas-based signature drawing component                |
| F9  | `validation.ts`                             |     220 | Shared client/server entry completeness checks          |
| F10 | `approval-validation.ts`                    |     198 | Server-side approval validation on detail view          |
| F11 | `log-sheet-status.ts`                       |      53 | Status transition rules                                 |
| F12 | `log-sheet-locking.ts`                      |      39 | Status/lock → editability decision                      |

### Features Layer — Supporting Artifacts

| File                        | Type | Role                         |
| --------------------------- | ---- | ---------------------------- |
| `log-sheet-locking.test.ts` | Test | Unit tests for locking rules |
| `service.test.ts`           | Test | Unit tests for service logic |
| `README.md`                 | Doc  | Feature overview             |
| `RISK_MATRIX.md`            | Doc  | Risk analysis                |
| `REFACTORING_PLAN.md`       | Doc  | Planned refactor slices      |
| `BASELINE_INVENTORY.md`     | Doc  | Initial module inventory     |
| `DEPENDENCY_MAP.md`         | Doc  | This document                |

**Total: ~6,000+ lines of runtime code** (excluding tests/docs)

---

## 2. Dependency Graph

### Legend

- `→` means "imports from"
- External deps prefixed with `@/` are outside this module

### App Layer → Features Layer

```
A1  → @/features/projects/actions, @/features/projects/types, A2
A2  → @/features/projects/types
A3  → @/features/projects/actions, @/features/projects/types,
       F1 (actions), F3 (types), A4, A5
A4  → F3 (types)
A5  → A6
A6  → F3 (types), F1 (actions),
       @/features/users/actions, @/@types/user.type
A7  → F1 (actions), F4 (utils), F6 (log-sheet-preview),
       F7 (signature-section),
       A8 (types), A9 (utils), A10, A11, A12, A13, A14,
       A15, A16, A17, A18, A19, A20, A21,
       @/hooks/use-mobile
A8  → F3 (types: TLogSheetStatus)
A9  → A8 (types)
A10 → @/features/chemicals/actions, @/@types/chemical.type
A11 → F4 (utils), A9 (utils), A8 (types)
A12 → F1 (actions), A8 (types)
A13 → F6b (category-helpers), @/@types/user.type, A8 (types)
A14 → F1 (actions), A8 (types)
A15 → F1 (actions), A8 (types)
A16 → F4 (utils), A10 (TChemicalUsageState type), A8 (types)
A17 → @/features/users/actions, @/@types/user.type
A18 → F4 (utils), F9 (validation), A8 (types)
```

### Features Layer Internal

```
F1 → F2 (service), F2a, F2b, F2c (via facade re-exports), F3 (types), F4 (utils),
      @/features/projects/service,
      @/features/parameters/types,
      @/@types/chemical.type,
      @/lib/auth-helpers, @/lib/rbac, @/@types/auth.type
F2 → F3 (types), F4 (utils),
      F10 (approval-validation),
      F11 (log-sheet-status),
      F12 (log-sheet-locking),
      @/lib/prisma,
      @/features/parameters/types,
      @/features/machines/types,
      @/@types/chemical.type,
      @/@types/auth.type,
      @/lib/rbac,
      @/features/projects/service,
      @/generated/prisma/client
F2a → F3 (types), F4 (utils), F12 (log-sheet-locking),
        @/lib/prisma, @/lib/rbac, @/features/projects/service
F2b → F3 (types), F12 (log-sheet-locking),
        @/lib/prisma, @/lib/rbac, @/features/projects/service
F2c → F12 (log-sheet-locking),
        @/lib/prisma, @/lib/rbac, @/features/projects/service
F3 → @/features/parameters/types
F4 → F3 (types)
F5 → (no local deps, uses next/image)
F6a → F4 (utils), F3 (types), F5 (log-sheet-header),
        F6b (category-helpers), F6c (format-helpers),
        F6d, F6e, F6f, F6g, F6h
F6b → F3 (types) — pure helper module
F6c → F3 (types) — pure helper module
F6d → F4 (utils), F6c (format-helpers), F3 (types)
F6e → F4 (utils), F6b (category-helpers), F6c (format-helpers), F3 (types)
F6f → F4 (utils), F6b (category-helpers), F6c (format-helpers), F3 (types)
F6g → (no local deps)
F6h → F4 (utils), F5 (log-sheet-header), F3 (types)
F7 → F1 (actions), F8 (signature-pad),
       @/components/signature/signature-preview,
       @/components/signature/signature-roles
F8 → (no local deps, uses React + ui/button)
F9 → F4 (utils), F3 (types)
F10 → F2 (service types), F3 (types), F4 (utils)
F11 → F3 (types)
F12 → F3 (types)
```

**Note:**

- F2a, F2b, F2c export functions that are re-exported by F2 via facade pattern. F1 imports from F2, not directly from extracted services.
- F6 (log-sheet-preview) is now a directory with F6a-F6h sub-modules.
- **Cross-layer coupling resolved:** A13 now imports from F6b (pure helper module) instead of F6a (UI component).

### Cross-Module External Dependencies

| External Module                            | Used By          |
| ------------------------------------------ | ---------------- |
| `@/features/projects/actions`              | A1, A3           |
| `@/features/projects/types`                | A1, A2, A3       |
| `@/features/projects/service`              | F1, F2           |
| `@/features/users/actions`                 | A6, A17          |
| `@/features/parameters/types`              | F1, F2, F3       |
| `@/features/parameters/limits-utils`       | F2               |
| `@/features/machines/types`                | F2               |
| `@/features/chemicals/actions`             | A10              |
| `@/@types/user.type`                       | A6, A13, A17     |
| `@/@types/chemical.type`                   | A10, F1, F2      |
| `@/@types/auth.type`                       | F1, F2           |
| `@/lib/prisma`                             | F2               |
| `@/lib/auth-helpers`                       | F1               |
| `@/lib/rbac`                               | F1, F2           |
| `@/hooks/use-mobile`                       | A7               |
| `@/components/signature/signature-preview` | F7               |
| `@/components/signature/signature-roles`   | F7               |
| `@/components/data-table`                  | A1, A3           |
| `@/components/crud-dialog`                 | A5               |
| `@/components/action-cell`                 | A4               |
| `@/components/camera-input`                | A7, A11          |
| `@/components/ui/*`                        | A1-A11 (various) |

---

## 3. Circular Dependency Analysis

**Result: 0 module-level circular dependencies.** ✅ RESOLVED

### ~~CIRC-1: `service.ts` ↔ `approval-validation.ts`~~ ✅ RESOLVED

Previously: F2 `service.ts` imported `validateLogSheetApprovalDetail` from F10, and F10 imported `ILogSheetDetailView` as a type from F2.

**Resolution (2026-02-22):** The `isEntryComplete` helper was removed from F2 `service.ts` during Phase 4 refactoring, reducing coupling. The type-only cycle still exists but is now documented as acceptable (type imports don't create runtime cycles).

### ~~Cross-layer coupling: A13 → F6~~ ✅ RESOLVED (2026-02-23)

**Previous issue:**

> A13 (`use-log-sheet-derived.ts`) imported `CATEGORY_ORDER` from F6 (`log-sheet-preview.tsx`).
> A constant used for data logic was exported from a UI component file.

**Resolution:** `CATEGORY_ORDER`, `sectionTitle`, and `machinesForCategory` were extracted to `F6b` (`category-helpers.ts`) — a pure helper module with no UI dependencies. A13 now imports from F6b instead of F6a.

---

## 4. God Classes / Oversized Files

Threshold: >300 lines or >10 exported functions/methods.

| File                                     |     Lines |         Functions/Exports         | Verdict                                                                                 |
| ---------------------------------------- | --------: | :-------------------------------: | --------------------------------------------------------------------------------------- |
| **A14** `log-sheet-category-section.tsx` |   **779** |      11 components + helpers      | 🟡 **LARGE** — Category tables with mobile/desktop branching                            |
| **F2** `service.ts`                      |   **753** |       17 exported functions       | 🟡 **LARGE** — Core CRUD, status, signatures (reduced from 1,008)                       |
| **F1** `actions.ts`                      |   **590** | **17 exported actions** + helpers | 🟡 **LARGE** — Many actions but each is thin wrapper around service                     |
| ~~**A7** `[logSheetId]/page.tsx`~~       | ~~1,245~~ |   ~~1 component, 7+ handlers~~    | ~~🔴 **GOD COMPONENT**~~ → 🟢 **NORMAL** (437 lines after Phase 3 extraction)           |
| ~~**F6** `log-sheet-preview.tsx`~~       |   ~~734~~ |    ~~1 component + 4 helpers~~    | ~~🟡 **LARGE**~~ → 🟢 **NORMAL** (extracted to 8 focused modules, largest is 262 lines) |

### Phase 5 Extraction Summary (2026-02-23)

| Extracted File                                   |   Lines | Functions/Exports                                       |
| ------------------------------------------------ | ------: | ------------------------------------------------------- |
| `log-sheet-preview/index.tsx`                    |     262 | `LogSheetPreview` (orchestrator)                        |
| `log-sheet-preview/general-category-section.tsx` |     155 | `GeneralCategorySection`                                |
| `log-sheet-preview/documentation-section.tsx`    |     130 | `DocumentationSection`                                  |
| `log-sheet-preview/cooling-water-section.tsx`    |     117 | `CoolingWaterSection`                                   |
| `log-sheet-preview/consumption-section.tsx`      |     108 | `ConsumptionSection`                                    |
| `log-sheet-preview/format-helpers.ts`            |      82 | `formatLimit`, `formatRawWaterLimit`, `formatValue`     |
| `log-sheet-preview/signatures-section.tsx`       |      70 | `SignaturesSection`                                     |
| `log-sheet-preview/category-helpers.ts`          |      37 | `CATEGORY_ORDER`, `sectionTitle`, `machinesForCategory` |
| **Total**                                        | **961** | **12 exports**                                          |

Original `log-sheet-preview.tsx` (734 lines) → 8 focused modules (avg 120 lines each).

### Detail: A7 `[logSheetId]/page.tsx` breakdown

- L1-55: Imports (55 lines — 7 hooks, 2 components, 4 utils, ~15 UI components)
- L56-131: Hook composition + state setup (75 lines)
- L133-193: Event handlers: `handleSave`, `handlePrint`, `handleSubmit`, `handleApprove` (60 lines)
- L195-233: Loading/guard + derived data (38 lines)
- L235-1164: **JSX render (~930 lines)** — includes:
  - Header/nav bar (55 lines)
  - Machine selection UI (100 lines)
  - Category loop with 3 distinct rendering paths:
    - `COOLING_WATER_QUALITY` desktop table (+mobile) (~300 lines)
    - General desktop table with machines (~200 lines)
    - Mobile entry cards (~30 lines)
  - Chemical usage section (6 lines — delegates to component)
  - Notes textarea (8 lines)
  - Preview mode (17 lines — delegates to component)
  - Mobile sticky action bar (17 lines)

### Detail: F2 `service.ts` breakdown

Selected exported functions (not exhaustive):
`getAllLogSheets`, `getLogSheetsByProject`, `getLogSheetProjectId`, `assertCanCreateLogSheet`, `createLogSheet`, `updateLogSheet`, `updateLogSheetStatus`, `deleteLogSheet`, `getLogSheetDetail`, `getLogSheetActiveMachines`, `upsertLogSheetMachines`, `upsertLogSheetEntries`, `upsertLogSheetPhotos`, `upsertLogSheetChemicalUsages`, `validateLogSheetForSubmission`, `validateLogSheetForApproval`, `saveLogSheetSignature`

---

## 5. Duplicated Code Blocks

### DUP-1: `TLogSheetRow` type definition

- **A3** `[projectId]/page.tsx` L21-29 — inline type `TLogSheetRow`
- **A4** `[projectId]/components/columns.tsx` L9-15 — identical type `TLogSheetRow`
- Neither imports from the other; both define the same shape independently.

### DUP-2: `formatDate()` function

- **A9** `[logSheetId]/utils.ts` L3-11 — `formatDate(value: string | Date)`
- **A4** `[projectId]/components/columns.tsx` L22-30 — `formatDate(value: Date | string)`
- Identical implementation with `id-ID` locale and same options.

### ~~DUP-3: `formatLimit()` function~~ ✅ RESOLVED

- ~~**A9** `[logSheetId]/utils.ts`~~ — ~~uses `min/max` fields, appends unit~~
- ~~**F6** `log-sheet-preview.tsx`~~ — ~~similar but adds BOOLEAN-specific labels~~

**Resolution:** `formatLimit`, `formatRawWaterLimit`, `formatValue` consolidated in `F6c` (`format-helpers.ts`). Preview components import from single source.

### ~~DUP-4: `formatRawWaterLimit()` function~~ ✅ RESOLVED

- ~~**A9** `[logSheetId]/utils.ts`~~
- ~~**F6** `log-sheet-preview.tsx`~~

**Resolution:** Moved to `F6c` (`format-helpers.ts`).

### DUP-5: `TEntryState` type

- **A8** `[logSheetId]/types.ts` L98-105 — includes `pendingFile?: File | null`
- **F3** `features/log-sheets/types.ts` L179-185 — omits `pendingFile`
- Two variants of the same concept, the app-layer version extends with client-only field.

### DUP-6: `TPreviewParameter` / `TParameter` / `TPreviewMachine` / `TMachine`

- **A8** `types.ts` defines `TParameter`, `TMachine`
- **F3** `types.ts` defines `TPreviewParameter`, `TPreviewMachine`
- Structurally identical types with different names in different files.

### ~~DUP-7: `machinesForCategory()` logic~~ ✅ RESOLVED

- ~~**A13** `use-log-sheet-derived.ts`~~ — ~~`machinesForCategory` callback~~
- ~~**F6** `log-sheet-preview.tsx`~~ — ~~`machinesForCategory` helper~~

**Resolution:** Extracted to `F6b` (`category-helpers.ts`). Both A13 and F6 now import from single source.

### ~~DUP-8: Inline `setEntryState` handlers~~ ✅ RESOLVED

- ~~**A14** `log-sheet-category-section.tsx` — ~15 occurrences of nearly identical `setEntryState(prev => ({ ...prev, [key]: { valueType: '...', ... } }))` patterns~~
- ~~**A11** `mobile-entry-card.tsx` — ~5 occurrences of the same pattern~~

**Resolution:** Extracted to `entry-state-helpers.ts` with 4 reusable updaters:

- `createNumberEntryUpdater(key, rawValue)`
- `createBooleanEntryUpdater(key, boolValue)`
- `createTextEntryUpdater(key, textValue)`
- `createCameraEntryUpdater(key, fileUrl, file)`

Both A14 and A11 now import and use these helpers.

### DUP-9: Technician fetch pattern

- **A6** `log-sheet-form.tsx` L64-70 — `getAllUsersAction().then(...)` in useEffect
- **A17** `use-log-sheet-technicians.ts` L9-15 — identical pattern
- Both fetch all users; form could reuse the hook.

### DUP-10: Validation logic overlap

- **F9** `validation.ts` — centralised entry completeness validation (`validateLogSheetEntries`)
- **A21** `use-log-sheet-validation.ts` — maps page state into `TLogSheetValidationInput` and calls F9
- **F2** `service.ts` — `validateLogSheetForSubmission` and `validateLogSheetForApproval` perform additional checks that partially overlap with F9
- Same business rules (required fields, machine selection, raw water/consumption) are enforced in multiple places with overlapping but not identical logic.

---

## 6. Dependency Diagram (Mermaid)

```mermaid
graph TD
    subgraph "App Layer: /log-sheets"
        A1["page.tsx<br/>(63L)"]
        A2["project-columns.tsx<br/>(29L)"]
    end

    subgraph "App Layer: /log-sheets/[projectId]"
        A3["page.tsx<br/>(136L)"]
        A4["columns.tsx<br/>(75L)"]
        A5["log-sheet-dialog.tsx<br/>(35L)"]
        A6["log-sheet-form.tsx<br/>(195L)"]
    end

    subgraph "App Layer: /log-sheets/[projectId]/[logSheetId]"
        A7["🔴 page.tsx<br/>(1167L)"]
        A8["types.ts<br/>(106L)"]
        A9["utils.ts<br/>(67L)"]
        A10["chemical-usage-section.tsx<br/>(211L)"]
        A11["mobile-entry-card.tsx<br/>(201L)"]
        A12["use-log-sheet-active-machines.ts<br/>(105L)"]
        A13["use-log-sheet-derived.ts<br/>(108L)"]
        A14["use-log-sheet-detail-data.ts<br/>(35L)"]
        A15["use-log-sheet-draft-saver.ts<br/>(144L)"]
        A16["use-log-sheet-draft-state.ts<br/>(93L)"]
        A17["use-log-sheet-technicians.ts<br/>(19L)"]
        A18["use-log-sheet-validation.ts<br/>(202L)"]
    end

    subgraph "Features Layer: /features/log-sheets"
        F1["🟡 actions.ts<br/>(520+L)"]
        F2["🔴 service.ts<br/>(1011+L)"]
        F3["types.ts<br/>(200L)"]
        F4["utils.ts<br/>(38L)"]
        F5["log-sheet-header.tsx<br/>(75L)"]
        F6["🟡 log-sheet-preview.tsx<br/>(713L)"]
        F7["signature-section.tsx<br/>(144L)"]
        F8["signature-pad.tsx<br/>(197L)"]
        F9["validation.ts<br/>(220L)"]
        F10["approval-validation.ts<br/>(198L)"]
        F11["log-sheet-status.ts<br/>(53L)"]
        F12["log-sheet-locking.ts<br/>(39L)"]
    end

    A1 --> A2
    A3 --> A4
    A3 --> A5
    A5 --> A6
    A7 --> A8
    A7 --> A9
    A7 --> A10
    A7 --> A11
    A7 --> A12
    A7 --> A13
    A7 --> A14
    A7 --> A15
    A7 --> A16
    A7 --> A17
    A7 --> A18

    A9 --> A8
    A11 --> A8
    A11 --> A9
    A12 --> A8
    A13 --> A8
    A14 --> A8
    A15 --> A8
    A15 --> A10
    A16 --> A8
    A16 --> A10
    A18 --> A8

    A3 --> F1
    A3 --> F3
    A4 --> F3
    A6 --> F1
    A6 --> F3
    A7 --> F1
    A7 --> F4
    A7 --> F6
    A7 --> F7
    A11 --> F4
    A12 --> F1
    A13 --> F6
    A14 --> F1
    A15 --> F1
    A16 --> F4
    A18 --> F4
    A18 --> F9
    A8 --> F3

    F1 --> F2
    F1 --> F3
    F1 --> F4
    F2 --> F3
    F2 --> F4
    F2 --> F10
    F2 --> F11
    F2 --> F12
    F4 --> F3
    F6 --> F3
    F6 --> F4
    F6 --> F5
    F7 --> F1
    F7 --> F8
    F9 --> F4
    F9 --> F3
    F10 --> F2
```

---

## 7. Summary of Key Findings

### After Phase 3, 4 & 5 Refactoring (2026-02-23)

| Category                      |                              Count                              | Severity |
| ----------------------------- | :-------------------------------------------------------------: | :------: |
| Total files                   |                               44                                |    —     |
| Total LOC                     |                             ~7,620                              |    —     |
| Circular dependencies         |                              **0**                              |    ✅    |
| God classes (>300L)           |              **3** (A14: 779L, F2: 753L, F1: 590L)              |    🟡    |
| Large files (>500L)           |              **3** (A14: 779L, F2: 753L, F1: 590L)              |    🟡    |
| Duplicated code blocks        |                     **4** (reduced from 11)                     |    🟡    |
| Cross-layer coupling concerns |                     **0** (resolved A13→F6)                     |    ✅    |
| Type duplication              | **3** (TEntryState, TParameter/TPreviewParameter, TLogSheetRow) |    🟡    |

### Improvements from Phase 5 (Preview Extraction)

- `log-sheet-preview.tsx` (734L monolith) → 8 focused modules (avg 120L each)
- `CATEGORY_ORDER` moved to pure helper module (resolves cross-layer coupling)
- `machinesForCategory` consolidated (resolves DUP-7)
- `formatLimit`, `formatRawWaterLimit`, `formatValue` consolidated (resolves DUP-3, DUP-4)
- Max method size reduced from ~600 lines to ~220 lines

### Remaining Technical Debt

| ID     | Issue                            | Recommendation                          |
| ------ | -------------------------------- | --------------------------------------- |
| DUP-1  | `TLogSheetRow` duplicated        | Move to shared types file               |
| DUP-2  | `formatDate` duplicated          | Consolidate to single utils file        |
| DUP-5  | `TEntryState` variants           | Extend base type in app layer           |
| DUP-6  | `TParameter`/`TPreviewParameter` | Unify to single type                    |
| DUP-8  | Inline `setEntryState` handlers  | Create shared handler factory           |
| DUP-9  | Technician fetch pattern         | Reuse hook in form component            |
| DUP-10 | Validation logic overlap         | Consolidate to single validation module |

---

_This document is machine-consumable. Use section numbers and file IDs (A1-A18, F1-F7) for reference in follow-up tasks._
