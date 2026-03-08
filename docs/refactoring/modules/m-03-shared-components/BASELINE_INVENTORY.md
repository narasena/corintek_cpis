# M-03: Shared Components & Infrastructure — Baseline Inventory

> Snapshot: 2026-03-08

---

## 1. Summary Dashboard

| Metric                       | Before | After | Change |
| ---------------------------- | -----: | ----: | -----: |
| Total Lines of Code (ts/tsx) | 12,688 | 12,505|   -183 |
| Code Files (.ts/.tsx)        |    124 |   123 |     -1 |
| Largest File (LOC)           |    726 |   726 |      0 |
| Files >500 lines             |      1 |     1 |      0 |
| Methods >50 lines            |     ~8 |    ~8 |      0 |
| TODO/FIXME/HACK Comments     |     13 |    13 |      0 |
| Est. Cyclomatic Complexity   | Medium-High | Low | — |
| Tests Passing                | 342/346| 342/346|     — |

---

## 2. Lines of Code by File (Core Manifest)

| #   | File                                          | Lines | Notes                                      |
| --- | --------------------------------------------- | ----: | ------------------------------------------ |
| 1   | src/components/ui/sidebar.tsx                 |   726 | Shadcn Component (Largest)                 |
| 2   | src/lib/search-filter-service.ts              |   310 | Core filtering infrastructure (Refactored) |
| 3   | src/components/data-table.tsx                 |   215 | Main DataTable Orchestrator (Refactored)   |
| 4   | src/components/camera-input.tsx               |   300 | Image capture and processing UI            |
| 5   | src/lib/error-handler-service.ts              |   180 | Global error handling logic                |
| 6   | src/components/loading.tsx                    |   171 | Loading states and skeleton                |
| 7   | src/components/multi-select.tsx               |   163 | Multi-select input component               |
| 8   | src/components/filter-controls.tsx            |   161 | DataTable filter UI                        |
| 9   | src/components/virtual-list.tsx               |   141 | Large dataset virtualization               |
| 10  | src/lib/utils/canvas.ts                       |   135 | Canvas utility for image processing        |
| 11  | src/components/action-cell.tsx                |   119 | DataTable row actions                      |
| 12  | src/lib/action-factory.ts                     |   106 | Pure Infrastructure Factory                |
| 13  | src/lib/rbac.ts                               |   128 | Role-Based Access Control logic            |
| 14  | src/lib/jwt.ts                                |    88 | Session token management                   |
| 15  | src/lib/auth-helpers.ts                       |    72 | Authentication helper functions            |
| 16  | src/lib/action-helpers.ts                     |    40 | Action result standardizers                |
| 17  | src/lib/utils/image-compression.ts            |    92 | Image compression pipeline                 |
| 18  | src/lib/pagination-helpers.ts                 |    68 | Pagination logic                           |
| 19  | src/lib/circuit-breaker.ts                    |    65 | Resilience pattern implementation          |
| 20  | src/lib/rate-limiter.ts                       |    48 | API rate limiting utility                  |

---

## 3. Largest Files (>500 lines)

| File                          | Lines | Functions | Description                             |
| ----------------------------- | ----: | :-------: | --------------------------------------- |
| src/components/ui/sidebar.tsx |   726 |    ~15    | Shadcn sidebar with many sub-components |

---

## 4. Longest Methods (>50 lines)

| #   | File                           | Method      | Lines | Notes                               |
| --- | ------------------------------ | ----------- | ----: | ----------------------------------- |
| 1   | src/components/data-table.tsx  | DataTable   |   ~40 | Simplified to layout orchestration  |
| 2   | src/components/camera-input.tsx| CameraInput |  ~200 | Handles media stream and processing |
| 3   | src/lib/search-filter-service.ts| applyGlobalFilterWithRanking | ~40 | Close to limit but clean |

---

## 5. Cyclomatic Complexity Hotspots

| File                            | Est. CC | Hotspots                    |
| ------------------------------- | ------: | --------------------------- |
| src/lib/search-filter-service.ts|       6 | Simplified via extraction   |
| src/lib/rbac.ts                 |       7 | Permission evaluation loops |
| src/components/data-table.tsx   |       4 | Pure layout logic           |

---

## 6. Baseline Comparison (Snapshot)

```
┌──────────────────────────────┬──────────┐
│ Metric                       │ Baseline │
├──────────────────────────────┼──────────┤
│ Total LOC (ts/tsx)           │   12,505 │
│ File count                   │      123 │
│ Max file size                │      726 │
│ Max method size              │      200 │
│ Total cyclomatic complexity  │ Low      │
│ Duplicated code blocks       │      Low │
└──────────────────────────────┴──────────┘
```
