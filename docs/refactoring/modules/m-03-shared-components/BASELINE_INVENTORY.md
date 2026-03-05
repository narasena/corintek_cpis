# M-03: Shared Components & Infrastructure — Baseline Inventory

> Snapshot: 2026-03-06

---

## 1. Summary Dashboard

| Metric                       | Before | After | Change |
| ---------------------------- | -----: | ----: | -----: |
| Total Lines of Code (ts/tsx) |  7,232 |     0 |      — |
| Code Files (.ts/.tsx)        |     59 |     0 |      — |
| Largest File (LOC)           |    726 |     0 |      — |
| Files >300 lines             |      5 |     0 |      — |
| Methods >50 lines            |      6 |     0 |      — |
| TODO/FIXME/HACK Comments     |      0 |     0 |      — |
| Est. Cyclomatic Complexity   | High   |     0 |      — |
| Tests Passing                |    N/A |     0 |      — |

---

## 2. Lines of Code by File (Core Manifest)

| #   | File                                          | Lines | Notes                                      |
| --- | --------------------------------------------- | ----: | ------------------------------------------ |
| 1   | src/components/machine-form-section.tsx       |   362 | Complex form logic for machines            |
| 2   | src/components/camera-input.tsx               |   356 | Camera access + Image compression          |
| 3   | src/components/data-table.tsx                 |   316 | God Component: Tabs, Sorting, Mobile Cards |
| 4   | src/lib/rbac.ts                               |   303 | Core RBAC matrix and access guards         |
| 5   | src/components/multi-select.tsx               |   145 | Shared multi-select logic                  |
| 6   | src/components/app-sidebar.tsx                |   132 | Layout sidebar                              |
| 7   | src/lib/utils/image-compression.ts            |   128 | Canvas manipulation & WebP processing      |
| 8   | src/components/action-cell.tsx                |   119 | Common data-table action menu              |
| 9   | src/lib/auth-helpers.ts                       |   118 | JWT & Cookie handling                      |
| 10  | src/components/nav-user.tsx                   |   115 | User profile navigation                    |
| 11  | src/lib/jwt.ts                                |    80 | Jose-based JWT utilities                   |
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
| 24  | src/lib/prisma.ts                             |    27 | Prisma client singleton                    |
| 25  | src/app/layout.tsx                            |    26 | Root HTML layout                           |
| 26  | src/hooks/use-mobile.ts                       |    21 | Media query hook                           |
| 27  | src/lib/utils/user.ts                         |    15 | User data helpers                          |
| 28  | src/components/print-button.tsx               |    13 | PDF/Print trigger                          |

*Note: 33 additional files in `src/components/ui/` (shadcn primitives) totaling ~4,500 lines are included in the Summary Dashboard but omitted here for brevity.*

---

## 3. Largest Files (>300 lines)

| File | Lines | Functions | Description |
| ---- | ----: | :-------: | ----------- |
| src/components/ui/sidebar.tsx | 726 | ~15 | Standard shadcn/ui sidebar wrapper |
| src/components/machine-form-section.tsx | 362 | 4 | Heavy React Hook Form integration |
| src/components/camera-input.tsx | 356 | 6 | Browser Camera API + WebP Compression |
| src/components/data-table.tsx | 316 | 3 | Complex conditional rendering (Desktop vs Mobile) |
| src/lib/rbac.ts | 303 | 10 | Centralized role/resource permission matrix |

---

## 4. Longest Methods (>50 lines)

| #   | File                                    | Method           | Lines | Notes                                      |
| --- | --------------------------------------- | ---------------- | ----: | ------------------------------------------ |
| 1   | src/components/data-table.tsx           | DataTableInner   |   180 | Contains large Desktop and Mobile views    |
| 2   | src/components/machine-form-section.tsx | MachineCard      |   150 | Massive JSX block for form fields          |
| 3   | src/components/camera-input.tsx         | capturePhoto     |    65 | Canvas manipulation & File processing      |
| 4   | src/components/camera-input.tsx         | handleFileChange |    60 | Async image processing from file input     |
| 5   | src/lib/rbac.ts                         | ROLE_CONFIG      |    150 | Massive static config object (not a method but a hotspot) |
| 6   | src/lib/auth-helpers.ts                 | getActor         |    55 | Multi-step cookie/JWT validation           |

---

## 5. Cyclomatic Complexity Hotspots

| File                                    | Est. CC | Hotspots                                      |
| --------------------------------------- | ------: | --------------------------------------------- |
| src/components/data-table.tsx           | High    | Mixed Tab/No-Tab logic + Desktop/Mobile bifurication |
| src/components/machine-form-section.tsx | Medium  | Repeated FormField blocks for various inputs  |
| src/components/camera-input.tsx         | High    | Async camera setup + manual Canvas crop logic |
| src/lib/rbac.ts                         | Medium  | Recursive permission checking (if implemented) |

---

## 6. Baseline Comparison (Snapshot)

```
┌──────────────────────────────┬──────────┐
│ Metric                       │ Baseline │
├──────────────────────────────┼──────────┤
│ Total LOC (ts/tsx)           │    7,232 │
│ File count                   │       59 │
│ Max file size                │      726 │
│ Max method size              │      180 │
│ Total cyclomatic complexity  │     High │
│ Duplicated code blocks       │   Medium │
└──────────────────────────────┴──────────┘
```
