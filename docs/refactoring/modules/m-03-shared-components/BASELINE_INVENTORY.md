# M-03: Shared Components & Infrastructure — Baseline Inventory

> Snapshot: 2026-03-06

---

## 1. Summary Dashboard

| Metric                       | Before | After | Change |
| ---------------------------- | -----: | ----: | -----: |
| Total Lines of Code (ts/tsx) |  7,232 | 6,860 |   -372 |
| Code Files (.ts/.tsx)        |     59 |    66 |    +7 |
| Largest File (LOC)           |    726 |   726 |      0 |
| Files >300 lines             |      5 |     2 |     -3 |
| Methods >50 lines            |      6 |     3 |     -3 |
| TODO/FIXME/HACK Comments     |      0 |     0 |      0 |
| Est. Cyclomatic Complexity   | High   | Medium |      — |
| Tests Passing                |    N/A |  1137 |      — |

---

## 2. Lines of Code by File (Core Manifest)

| #   | File                                          | Lines | Notes                                      |
| --- | --------------------------------------------- | ----: | ------------------------------------------ |
| 1   | src/components/data-table.tsx                 |   110 | **Refactored**: Pure orchestrator          |
| 2   | src/lib/rbac.ts                               |   121 | **Refactored**: Pure logic coordinator     |
| 3   | src/lib/rbac/policies/staff.policy.ts         |    88 | **New**: Staff permission policy           |
| 4   | src/lib/rbac/policies/client.policy.ts        |    54 | **New**: Client permission policy          |
| 5   | src/lib/rbac/types.ts                         |    46 | **New**: RBAC type definitions             |
| 6   | src/lib/rbac/policies/admin.policy.ts         |    22 | **New**: Admin permission policy           |
| 7   | src/components/camera-input.tsx               |   276 | **Refactored**: Uses unified pipeline      |
| 8   | src/components/multi-select.tsx               |   163 | **Refactored**: Extracted sub-components   |
| 9   | src/lib/auth-helpers.ts                       |    72 | **Refactored**: Pure session/JWT logic     |
| 10  | src/lib/jwt.ts                                |    96 | **Refactored**: Discriminated Error codes  |
| 11  | src/lib/utils/image-compression.ts            |    92 | **Refactored**: Uses canvas utility        |
| 12  | src/lib/utils/canvas.ts                       |   135 | **Refactored**: Internal context factory   |
| 13  | src/lib/constants/auth.ts                     |    23 | **New**: Security primitives               |
| 14  | src/lib/constants/navigation.ts               |    84 | **New**: Navigation Schema                 |
| 15  | src/components/app-sidebar.tsx                |    69 | **Refactored**: Modular subgroups          |
| 16  | src/components/nav-main.tsx                   |    56 | **Refactored**: Supports group labels      |
| 17  | src/components/data-table/data-table-view.tsx |    32 | **New**: Responsive view switcher          |
| 18  | src/components/data-table/desktop-view.tsx    |    82 | **New**: Table-based desktop view          |
| 19  | src/components/data-table/mobile-view.tsx     |    92 | **New**: Card-based mobile view            |
| 20  | src/components/data-table/types.ts            |    25 | **New**: DataTable interfaces              |
| 21  | src/lib/action-factory.ts                     |   110 | **Refactored**: Dependency Injection       |
| 22  | src/lib/action-helpers.ts                     |    40 | **Refactored**: Standardized TActionResult |

---

## 6. Baseline Comparison (Snapshot)

```
┌──────────────────────────────┬──────────┬──────────┐
│ Metric                       │ Baseline │  Current │
├──────────────────────────────┼──────────┼──────────┤
│ Total LOC (ts/tsx)           │    7,232 │    6,860 │
│ File count                   │       59 │       66 │
│ Max file size                │      726 │      726 │
│ Max method size              │      180 │      180 │
│ Total cyclomatic complexity  │     High │   Medium │
│ Duplicated code blocks       │   Medium │      Low │
└──────────────────────────────┴──────────┴──────────┘
```
