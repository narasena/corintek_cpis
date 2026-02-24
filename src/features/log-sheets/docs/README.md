# Log Sheets Module Documentation

## Status: Refactored (2026-02-24)

This module has undergone significant refactoring to reduce complexity and improve maintainability.

## Documentation Index

| Document                                                       | Purpose                                        |
| -------------------------------------------------------------- | ---------------------------------------------- |
| [BASELINE_INVENTORY.md](./BASELINE_INVENTORY.md)               | LOC metrics, file sizes, complexity tracking   |
| [CHARACTERIZATION_FINDINGS.md](./CHARACTERIZATION_FINDINGS.md) | Surprising behaviors discovered during testing |
| [DEPENDENCY_MAP.md](./DEPENDENCY_MAP.md)                       | Module dependency graph                        |
| [REFACTORING_PLAN.md](./REFACTORING_PLAN.md)                   | Phased refactoring roadmap (80% complete)      |
| [RISK_MATRIX.md](./RISK_MATRIX.md)                             | Risk assessment for each refactoring phase     |
| [TEST_COVERAGE_ANALYSIS.md](./TEST_COVERAGE_ANALYSIS.md)       | Test coverage metrics and gaps                 |

## Key Improvements (Phase 3, 4, 5, 6, 7, 8, 9, 10, 11 & Folder Reorg)

| Metric                      | Before      | After       | Change   |
| --------------------------- | ----------- | ----------- | -------- |
| `page.tsx` LOC              | 1,245       | 437         | **-65%** |
| `service.ts` LOC            | 1,008       | 753         | **-25%** |
| Max file size               | 1,245       | 779         | **-37%** |
| Total cyclomatic complexity | ~180        | ~140        | **-22%** |
| Tests                       | 652 passing | 719 passing | ✅       |

## New Extracted Components

### UI Components (Phase 3, moved to features in Folder Reorg)

- `log-sheet-toolbar.tsx` (89 lines) — Toolbar with mode toggle, save/print/submit
- `machine-selection-panel.tsx` (132 lines) — Chiller/cooling tower selection UI
- `log-sheet-category-section.tsx` (779 lines) — All category tables rendering

### Services (Phase 4)

- `log-sheet-entries.service.ts` (157 lines) — Entry upsert logic
- `log-sheet-photos.service.ts` (128 lines) — Photo upload handling
- `log-sheet-chemicals.service.ts` (126 lines) — Chemical usage persistence

## Module Structure (After Folder Reorg 2026-02-24)

```
src/
├── app/(main)/log-sheets/
│   ├── page.tsx                           # Project list
│   ├── page.characterization.test.tsx     # Colocated test
│   ├── components/
│   │   └── project-columns.tsx            # Route-specific columns
│   ├── [projectId]/
│   │   ├── page.tsx                       # Log sheet list
│   │   ├── page.characterization.test.tsx
│   │   └── components/
│   │       └── columns.tsx                # Route-specific columns
│   └── [projectId]/[logSheetId]/
│       ├── page.tsx                       # Detail page (437 lines, was 1245)
│       ├── page.characterization.test.tsx
│       ├── components/
│       │   ├── entry-cells.tsx            # Page-specific entry cells
│       │   └── mobile-entry-card.tsx      # Page-specific mobile card
│       ├── hooks/                         # Page-specific hooks
│       │   ├── use-log-sheet-active-machines.ts
│       │   ├── use-log-sheet-derived.ts
│       │   ├── use-log-sheet-detail-data.ts
│       │   ├── use-log-sheet-draft-saver.ts
│       │   ├── use-log-sheet-draft-state.ts
│       │   └── use-log-sheet-validation.ts
│       ├── types.ts
│       ├── utils.ts
│       └── entry-state-helpers.ts
│
└── features/log-sheets/
    ├── service.ts                         # Core CRUD (753 lines, was 1008)
    ├── service.characterization.test.ts   # Colocated test
    ├── actions.ts                         # Server actions (590 lines)
    ├── actions.characterization.test.ts
    ├── log-sheet-entries.service.ts       # Entry upsert
    ├── log-sheet-photos.service.ts        # Photo upload
    ├── log-sheet-chemicals.service.ts     # Chemical usage
    ├── components/                        # Domain components
    │   ├── log-sheet-form.tsx             # Create form
    │   ├── log-sheet-dialog.tsx           # Create dialog wrapper
    │   ├── log-sheet-toolbar.tsx          # Detail page toolbar
    │   ├── machine-selection-panel.tsx    # Machine selection UI
    │   ├── log-sheet-category-section.tsx # Category tables
    │   ├── chemical-usage-section.tsx     # Chemical usage CRUD
    │   ├── signature-section.tsx          # Signature UI
    │   ├── signature-pad.tsx              # Canvas signature
    │   ├── log-sheet-header.tsx           # Print header
    │   └── log-sheet-preview/             # Print preview modules
    ├── hooks/                             # Reusable hooks
    │   └── use-log-sheet-technicians.ts
    ├── internal/                          # Internal helpers
    │   └── edit-permission.ts
    ├── types.ts
    ├── validation.ts
    ├── utils.ts
    ├── approval-validation.ts
    ├── log-sheet-status.ts
    └── log-sheet-locking.ts
```

## Folder Organization Rules

| Component Type       | Location                               | Example                        |
| -------------------- | -------------------------------------- | ------------------------------ |
| Route-scoped columns | `app/(main)/[route]/components/`       | `columns.tsx`                  |
| Domain components    | `features/[domain]/components/`        | `log-sheet-form.tsx`           |
| Reusable hooks       | `features/[domain]/hooks/`             | `use-log-sheet-technicians.ts` |
| Tests                | Colocated (`*.test.ts` next to source) | `service.test.ts`              |
