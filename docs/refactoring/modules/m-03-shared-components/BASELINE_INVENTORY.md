# M-03: Shared Components & Infrastructure — Baseline Inventory

> Snapshot: 2026-03-06

---

## 1. Summary Dashboard

| Metric                       | Before | After | Change |
| ---------------------------- | -----: | ----: | -----: |
| Total Lines of Code (ts/tsx) |  7,232 | 6,888 |   -344 |
| Code Files (.ts/.tsx)        |     59 |    66 |    +7 |
| Largest File (LOC)           |    726 |   726 |      0 |
| Files >300 lines             |      5 |     2 |     -3 |
| Methods >50 lines            |      6 |     3 |     -3 |
| TODO/FIXME/HACK Comments     |      0 |     0 |      0 |
| Est. Cyclomatic Complexity   | High   | Medium |      — |
| Tests Passing                |    N/A |   160 |      — |

---

## 2. Lines of Code by File (Core Manifest)

| #   | File                                          | Lines | Notes                                      |
| --- | --------------------------------------------- | ----: | ------------------------------------------ |
| 1   | src/components/data-table.tsx                 |   316 | God Component: Tabs, Sorting, Mobile Cards |
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
| 13  | src/lib/constants/navigation.ts               |    84 | **New**: Navigation Schema                 |
| 14  | src/components/app-sidebar.tsx                |    69 | **Refactored**: Modular subgroups          |
| 15  | src/components/nav-main.tsx                   |    56 | **Refactored**: Supports group labels      |
| 16  | src/components/action-cell.tsx                |   119 | Common data-table action menu              |
| 17  | src/components/nav-user.tsx                   |   115 | User profile navigation                    |
| 18  | src/app/(main)/_components/metric-line-chart.tsx |  75 | Shared Recharts wrapper                    |
| 19  | src/components/mobile-nav.tsx                 |    73 | Mobile layout navigation                   |
| 20  | src/components/crud-dialog.tsx                |    66 | Generic CRUD wrapper                       |
| 21  | src/components/date-picker.tsx                |    59 | Wrapper around Radix/DayPicker             |
| 22  | src/app/(main)/layout.tsx                     |    55 | Main app shell layout                      |
| 23  | src/lib/prisma-selects.ts                     |    52 | Shared Prisma include/select fragments     |
| 24  | src/hooks/use-image-compression.ts            |    49 | Hook wrapper for compression engine        |
| 25  | src/components/signature/signature-preview.tsx |    45 | Signature display                          |
| 26  | src/lib/action-helpers.ts                     |    38 | Server action result types                 |
| 27  | src/lib/r2-upload.ts                          |    31 | R2/Cloudflare upload utility               |
| 28  | src/lib/utils.ts                              |    28 | Shared UI utils (cn)                       |
| 29  | src/lib/prisma.ts                             |    41 | **Refactored**: Singleton with lazy init   |
| 30  | src/lib/constants/auth.ts                     |    23 | **New**: Security primitives               |
| 31  | src/app/layout.tsx                            |    26 | Root HTML layout                           |
| 32  | src/hooks/use-mobile.ts                       |    21 | Media query hook                           |
| 33  | src/lib/utils/user.ts                         |    15 | User data helpers                          |
| 34  | src/components/print-button.tsx               |    13 | PDF/Print trigger                          |

*Note: 33 additional files in `src/components/ui/` (shadcn primitives) totaling ~4,500 lines are included in the Summary Dashboard.*

---

## 6. Baseline Comparison (Snapshot)

```
┌──────────────────────────────┬──────────┬──────────┐
│ Metric                       │ Baseline │  Current │
├──────────────────────────────┼──────────┼──────────┤
│ Total LOC (ts/tsx)           │    7,232 │    6,888 │
│ File count                   │       59 │       66 │
│ Max file size                │      726 │      726 │
│ Max method size              │      180 │      180 │
│ Total cyclomatic complexity  │     High │   Medium │
│ Duplicated code blocks       │   Medium │      Low │
└──────────────────────────────┴──────────┴──────────┘
```
