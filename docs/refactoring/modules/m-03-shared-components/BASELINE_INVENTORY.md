# M-03: Shared Components — Baseline Inventory

> Snapshot: 2026-03-04

---

## 1. Summary Dashboard

| Metric                       | Before | After | Change |
| ---------------------------- | -----: | ----: | -----: |
| Total Lines of Code (tsx)    |  5,033 |     0 |      — |
| Code Files (.tsx/.ts)        |     43 |     0 |      — |
| Largest File (LOC)           |    726 |     0 |      — |
| Files >300 lines             |      4 |     0 |      — |
| Methods >50 lines            |      4 |     0 |      — |
| TODO/FIXME/HACK Comments     |      0 |     0 |      — |
| Est. Cyclomatic Complexity   | High   |     0 |      — |
| Tests Passing                |      0 |     0 |      — |

---

## 2. Lines of Code by File (Top 15 custom components)

| #   | File                                     | Lines | Notes                                      |
| --- | ---------------------------------------- | ----: | ------------------------------------------ |
| 1   | src/components/ui/sidebar.tsx            |   726 | Large library-like component               |
| 2   | src/components/machine-form-section.tsx  |   362 | Complex form logic for machines            |
| 3   | src/components/camera-input.tsx          |   356 | Camera access + Image compression          |
| 4   | src/components/data-table.tsx            |   316 | God Component: Tabs, Sorting, Mobile Cards |
| 5   | src/components/multi-select.tsx          |   145 | Shared multi-select logic                  |
| 6   | src/components/app-sidebar.tsx           |   132 | Layout sidebar                              |
| 7   | src/components/action-cell.tsx           |   119 | Common data-table action menu              |
| 8   | src/components/nav-user.tsx              |   115 | User profile navigation                     |
| 9   | src/components/mobile-nav.tsx            |    73 | Mobile layout navigation                    |
| 10  | src/components/crud-dialog.tsx           |    66 | Generic CRUD wrapper                       |
| 11  | src/components/date-picker.tsx           |    59 | Wrapper around Radix/DayPicker             |
| 12  | src/components/nav-main.tsx              |    50 | Main navigation menu                       |
| 13  | src/components/signature/signature-preview.tsx | 45 | Signature display                          |
| 14  | src/components/header-title.tsx          |    26 | Page header title                          |
| 15  | src/components/print-button.tsx          |    13 | PDF/Print trigger                          |

---

## 3. Largest Files (>300 lines)

| File | Lines | Functions | Description |
| ---- | ----: | :-------: | ----------- |
| src/components/ui/sidebar.tsx | 726 | ~15 | Standard shadcn/ui sidebar (low priority for refactor) |
| src/components/machine-form-section.tsx | 362 | 4 | Heavy React Hook Form integration |
| src/components/camera-input.tsx | 356 | 6 | Browser Camera API + WebP Compression |
| src/components/data-table.tsx | 316 | 3 | Complex conditional rendering (Desktop vs Mobile) |

---

## 4. Longest Methods (>50 lines)

| #   | File                     | Method         | Lines | Notes                                      |
| --- | ------------------------ | -------------- | ----: | ------------------------------------------ |
| 1   | src/components/data-table.tsx | DataTableInner |   180 | Contains large Desktop and Mobile views    |
| 2   | src/components/machine-form-section.tsx | MachineCard |   150 | Massive JSX block for form fields          |
| 3   | src/components/camera-input.tsx | capturePhoto   |    65 | Canvas manipulation & File processing      |
| 4   | src/components/camera-input.tsx | handleFileChange | 60 | Async image processing from file input     |

---

## 5. Cyclomatic Complexity Hotspots

| File                                    | Est. CC | Hotspots                                      |
| --------------------------------------- | ------: | --------------------------------------------- |
| src/components/data-table.tsx           | High    | Mixed Tab/No-Tab logic + Desktop/Mobile bifurication |
| src/components/machine-form-section.tsx | Medium  | Repeated FormField blocks for various inputs  |
| src/components/camera-input.tsx         | High    | Async camera setup + manual Canvas crop logic |

---

## 6. Baseline Comparison (Snapshot)

```
┌──────────────────────────────┬──────────┐
│ Metric                       │ Baseline │
├──────────────────────────────┼──────────┤
│ Total LOC (tsx)              │    5,033 │
│ File count                   │       43 │
│ Max file size                │      726 │
│ Max method size              │      180 │
│ Total cyclomatic complexity  │     High │
│ Duplicated code blocks       │   Medium │
└──────────────────────────────┴──────────┘
```
