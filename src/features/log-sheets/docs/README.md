# Log Sheets Module Documentation

## Status: Refactored (2026-02-23)

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

## Key Improvements (Phase 3 & 4)

| Metric                      | Before      | After       | Change   |
| --------------------------- | ----------- | ----------- | -------- |
| `page.tsx` LOC              | 1,245       | 437         | **-65%** |
| `service.ts` LOC            | 1,008       | 753         | **-25%** |
| Max file size               | 1,245       | 779         | **-37%** |
| Total cyclomatic complexity | ~180        | ~140        | **-22%** |
| Tests                       | 652 passing | 652 passing | ✅       |

## New Extracted Components

### UI Components (Phase 3)

- `log-sheet-toolbar.tsx` (89 lines) — Toolbar with mode toggle, save/print/submit
- `machine-selection-panel.tsx` (132 lines) — Chiller/cooling tower selection UI
- `log-sheet-category-section.tsx` (779 lines) — All category tables rendering

### Services (Phase 4)

- `log-sheet-entries.service.ts` (157 lines) — Entry upsert logic
- `log-sheet-photos.service.ts` (128 lines) — Photo upload handling
- `log-sheet-chemicals.service.ts` (126 lines) — Chemical usage persistence

## Module Structure

```
src/
├── app/(main)/log-sheets/
│   ├── page.tsx                           # Project list
│   ├── [projectId]/
│   │   ├── page.tsx                       # Log sheet list
│   │   └── components/
│   ├── [projectId]/[logSheetId]/
│   │   ├── page.tsx                       # Detail page (437 lines, was 1245)
│   │   ├── components/
│   │   │   ├── log-sheet-toolbar.tsx      # NEW
│   │   │   ├── machine-selection-panel.tsx # NEW
│   │   │   ├── log-sheet-category-section.tsx # NEW
│   │   │   ├── chemical-usage-section.tsx
│   │   │   └── mobile-entry-card.tsx
│   │   ├── hooks/
│   │   ├── types.ts
│   │   └── utils.ts
│   └── components/
└── features/log-sheets/
    ├── service.ts                         # Core CRUD (753 lines, was 1008)
    ├── actions.ts                         # Server actions (590 lines)
    ├── log-sheet-entries.service.ts       # NEW
    ├── log-sheet-photos.service.ts        # NEW
    ├── log-sheet-chemicals.service.ts     # NEW
    ├── components/
    │   └── log-sheet-preview.tsx
    ├── types.ts
    ├── validation.ts
    └── utils.ts
```
