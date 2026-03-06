# M-03: Shared Components & Infrastructure — Baseline Inventory

> Snapshot: 2026-03-06

---

## 1. Summary Dashboard

| Metric                       | Before | After | Change |
| ---------------------------- | -----: | ----: | -----: |
| Total Lines of Code (ts/tsx) |  7,232 | 6,941 |   -291 |
| Code Files (.ts/.tsx)        |     59 |    59 |      0 |
| Largest File (LOC)           |    726 |   726 |      0 |
| Files >300 lines             |      5 |     4 |     -1 |
| Methods >50 lines            |      6 |     5 |     -1 |
| TODO/FIXME/HACK Comments     |      0 |     0 |      0 |
| Est. Cyclomatic Complexity   | High   | High  |      — |
| Tests Passing                |    N/A |    83 |      — |

---

## 2. Lines of Code by File (Core Manifest)

| #   | File                                          | Lines | Notes                                      |
| --- | --------------------------------------------- | ----: | ------------------------------------------ |
| 1   | src/components/camera-input.tsx               |   356 | Camera access + Image compression          |
| 2   | src/components/data-table.tsx                 |   316 | God Component: Tabs, Sorting, Mobile Cards |
| 3   | src/lib/rbac.ts                               |   303 | Core RBAC matrix and access guards         |
| 4   | src/components/multi-select.tsx               |   163 | **Refactored**: Extracted sub-components   |
| 5   | src/components/app-sidebar.tsx                |   132 | Layout sidebar                              |
| 6   | src/lib/utils/image-compression.ts            |   128 | Canvas manipulation & WebP processing      |
| 7   | src/components/action-cell.tsx                |   119 | Common data-table action menu              |
| 8   | src/lib/auth-helpers.ts                       |   118 | JWT & Cookie handling                      |
| 9   | src/components/nav-user.tsx                   |   115 | User profile navigation                    |
| 10  | src/lib/jwt.ts                                |    96 | **Refactored**: Discriminated Error codes  |
| 11  | src/app/(main)/_components/metric-line-chart.tsx |  75 | Shared Recharts wrapper                    |
| 12  | src/components/mobile-nav.tsx                 |    73 | Mobile layout navigation                   |
| 13  | src/components/crud-dialog.tsx                |    66 | Generic CRUD wrapper                       |
| 14  | src/components/date-picker.tsx                |    59 | Wrapper around Radix/DayPicker             |
| 15  | src/app/(main)/layout.tsx                     |    55 | Main app shell layout                      |
| 16  | src/lib/prisma-selects.ts                     |    52 | Shared Prisma include/select fragments     |
| 17  | src/components/nav-main.tsx                   |    50 | Main navigation menu                       |
| 18  | src/hooks/use-image-compression.ts            |    49 | Hook wrapper for compression engine        |
| 19  | src/components/signature/signature-preview.tsx |    45 | Signature display                          |
| 20  | src/lib/action-helpers.ts                     |    38 | Server action result types                 |
| 21  | src/lib/r2-upload.ts                          |    31 | R2/Cloudflare upload utility               |
| 22  | src/lib/utils.ts                              |    28 | Shared UI utils (cn)                       |
| 23  | src/lib/prisma.ts                             |    41 | **Refactored**: Singleton with lazy init   |
| 24  | src/lib/constants/auth.ts                     |    23 | **New**: Security primitives               |
| 25  | src/app/layout.tsx                            |    26 | Root HTML layout                           |
| 26  | src/hooks/use-mobile.ts                       |    21 | Media query hook                           |
| 27  | src/lib/utils/user.ts                         |    15 | User data helpers                          |
| 28  | src/components/print-button.tsx               |    13 | PDF/Print trigger                          |

*Note: 33 additional files in `src/components/ui/` (shadcn primitives) totaling ~4,500 lines are included in the Summary Dashboard but omitted here for brevity. MachineFormSection (362 LOC) was moved to M-09.*

---

## 6. Baseline Comparison (Snapshot)

```
┌──────────────────────────────┬──────────┬──────────┐
│ Metric                       │ Baseline │  Current │
├──────────────────────────────┼──────────┼──────────┤
│ Total LOC (ts/tsx)           │    7,232 │    6,941 │
│ File count                   │       59 │       59 │
│ Max file size                │      726 │      726 │
│ Max method size              │      180 │      180 │
│ Total cyclomatic complexity  │     High │     High │
│ Duplicated code blocks       │   Medium │   Medium │
└──────────────────────────────┴──────────┴──────────┘
```
