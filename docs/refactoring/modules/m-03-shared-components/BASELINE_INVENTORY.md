# M-03: Shared Components & Infrastructure — Baseline Inventory

> Snapshot: 2026-03-06

---

## 1. Summary Dashboard

| Metric                       | Before | After | Change |
| ---------------------------- | -----: | ----: | -----: |
| Total Lines of Code (ts/tsx) |  7,232 | 6,935 |   -297 |
| Code Files (.ts/.tsx)        |     59 |    61 |    +2 |
| Largest File (LOC)           |    726 |   726 |      0 |
| Files >300 lines             |      5 |     3 |     -2 |
| Methods >50 lines            |      6 |     3 |     -3 |
| TODO/FIXME/HACK Comments     |      0 |     0 |      0 |
| Est. Cyclomatic Complexity   | High   | Medium |      — |
| Tests Passing                |    N/A |    87 |      — |

---

## 2. Lines of Code by File (Core Manifest)

| #   | File                                          | Lines | Notes                                      |
| --- | --------------------------------------------- | ----: | ------------------------------------------ |
| 1   | src/components/data-table.tsx                 |   316 | God Component: Tabs, Sorting, Mobile Cards |
| 2   | src/lib/rbac.ts                               |   303 | Core RBAC matrix and access guards         |
| 3   | src/components/camera-input.tsx               |   276 | **Refactored**: Uses unified pipeline      |
| 4   | src/components/multi-select.tsx               |   163 | **Refactored**: Extracted sub-components   |
| 5   | src/components/app-sidebar.tsx                |   132 | Layout sidebar                              |
| 6   | src/lib/auth-helpers.ts                       |   118 | JWT & Cookie handling                      |
| 7   | src/lib/jwt.ts                                |    96 | **Refactored**: Discriminated Error codes  |
| 8   | src/lib/utils/image-compression.ts            |    92 | **Refactored**: Uses canvas utility        |
| 9   | src/lib/utils/canvas.ts                       |    85 | **New**: Extracted Canvas primitives       |
| 10  | src/components/action-cell.tsx                |   119 | Common data-table action menu              |
| 11  | src/components/nav-user.tsx                   |   115 | User profile navigation                    |
| 12  | src/app/(main)/_components/metric-line-chart.tsx |  75 | Shared Recharts wrapper                    |
| 13  | src/components/mobile-nav.tsx                 |    73 | Mobile layout navigation                   |
| 14  | src/components/crud-dialog.tsx                |    66 | Generic CRUD wrapper                       |
| 15  | src/components/date-picker.tsx                |    59 | Wrapper around Radix/DayPicker             |
| 16  | src/app/(main)/layout.tsx                     |    55 | Main app shell layout                      |
| 17  | src/lib/prisma-selects.ts                     |    52 | Shared Prisma include/select fragments     |
| 18  | src/components/nav-main.tsx                   |    50 | Main navigation menu                       |
| 19  | src/hooks/use-image-compression.ts            |    49 | Hook wrapper for compression engine        |
| 20  | src/components/signature/signature-preview.tsx |    45 | Signature display                          |
| 21  | src/lib/action-helpers.ts                     |    38 | Server action result types                 |
| 22  | src/lib/r2-upload.ts                          |    31 | R2/Cloudflare upload utility               |
| 23  | src/lib/utils.ts                              |    28 | Shared UI utils (cn)                       |
| 24  | src/lib/prisma.ts                             |    41 | **Refactored**: Singleton with lazy init   |
| 25  | src/lib/constants/auth.ts                     |    23 | **New**: Security primitives               |
| 26  | src/app/layout.tsx                            |    26 | Root HTML layout                           |
| 27  | src/hooks/use-mobile.ts                       |    21 | Media query hook                           |
| 28  | src/lib/utils/user.ts                         |    15 | User data helpers                          |
| 29  | src/components/print-button.tsx               |    13 | PDF/Print trigger                          |

*Note: 33 additional files in `src/components/ui/` (shadcn primitives) totaling ~4,500 lines are included in the Summary Dashboard but omitted here for brevity.*

---

## 6. Baseline Comparison (Snapshot)

```
┌──────────────────────────────┬──────────┬──────────┐
│ Metric                       │ Baseline │  Current │
├──────────────────────────────┼──────────┼──────────┤
│ Total LOC (ts/tsx)           │    7,232 │    6,935 │
│ File count                   │       59 │       61 │
│ Max file size                │      726 │      726 │
│ Max method size              │      180 │      180 │
│ Total cyclomatic complexity  │     High │   Medium │
│ Duplicated code blocks       │   Medium │      Low │
└──────────────────────────────┴──────────┴──────────┘
```
