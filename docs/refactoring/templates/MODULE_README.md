# {Module Name} — Module Summary

> Last Updated: {YYYY-MM-DD}

<!-- PROMPT FOR AI AGENT (Phase 6d):
"Generate a module summary/README based on the completed refactoring:
1. Key improvements with before/after metrics from BASELINE_INVENTORY.md
2. List of new extracted components/files created during refactoring
3. Final module file structure tree
4. Folder organization rules applied
This serves as the landing page for anyone reading about this module."
-->

---

## Status: {Refactored / In Progress} ({YYYY-MM-DD})

{Brief description of the module and its refactoring status.}

## Documentation Index

| Document                                                       | Purpose                                        |
| -------------------------------------------------------------- | ---------------------------------------------- |
| [BASELINE_INVENTORY.md](./BASELINE_INVENTORY.md)               | LOC metrics, file sizes, complexity tracking   |
| [CHARACTERIZATION_FINDINGS.md](./CHARACTERIZATION_FINDINGS.md) | Surprising behaviors discovered during testing |
| [DEPENDENCY_MAP.md](./DEPENDENCY_MAP.md)                       | Module dependency graph                        |
| [REFACTORING_PLAN.md](./REFACTORING_PLAN.md)                   | Phased refactoring roadmap                     |
| [RISK_MATRIX.md](./RISK_MATRIX.md)                             | Risk assessment per file                       |
| [TEST_COVERAGE_ANALYSIS.md](./TEST_COVERAGE_ANALYSIS.md)       | Test coverage metrics and gaps                 |

## Key Improvements

| Metric                             | Before | After | Change |
| ---------------------------------- | -----: | ----: | -----: |
| {e.g. Largest File LOC}            |      0 |     0 |  {-0%} |
| {e.g. Total Cyclomatic Complexity} |      0 |     0 |  {-0%} |
| {e.g. Tests Passing}               |      0 |     0 |   {+0} |

## New Extracted Components

### {Phase Description}

- `{file_path}` ({lines} lines) — {Responsibility}

## Module Structure (Final)

```
src/
├── app/(main)/{module}/
│   ├── page.tsx
│   └── components/
└── features/{module}/
    ├── service.ts
    ├── actions.ts
    ├── components/
    ├── hooks/
    └── types.ts
```

## Folder Organization Rules

| Component Type    | Location                               | Example                |
| ----------------- | -------------------------------------- | ---------------------- |
| Route-scoped      | `app/(main)/[route]/components/`       | `columns.tsx`          |
| Domain components | `features/[domain]/components/`        | `{module}-form.tsx`    |
| Reusable hooks    | `features/[domain]/hooks/`             | `use-{module}-data.ts` |
| Tests             | Colocated (`*.test.ts` next to source) | `service.test.ts`      |
