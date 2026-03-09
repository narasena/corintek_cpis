# M-01: Database Schema — Baseline Inventory

> Snapshot: 2026-03-07
> Status: **REFAC DEFERRED**

---

## 1. Summary Dashboard

| Metric                       | Before | After | Change |
| ---------------------------- | -----: | ----: | -----: |
| Total Lines of Code (prisma) |    758 |   758 |      0 |
| Code Files (.prisma)         |     14 |    14 |      0 |
| Largest File (LOC)           |    125 |   125 |      0 |
| Files >500 lines             |      0 |     0 |      — |
| Total Models                 |     23 |    23 |      0 |
| TODO/FIXME/HACK Comments     |      0 |     2 |     +2 |
| Est. Complexity Score        |    Low |   Low |      — |
| Tests Passing                |    N/A |   9/9 |      — |

*Note: 2 comments added to prisma schema to mark deferred standardization columns.*

---

## 2. Lines of Code by File (sorted ascending)

| #   | File                                          | Lines | Notes |
| --- | --------------------------------------------- | ----: | ----- |
| 1   | prisma/schema/schema.prisma                   |    12 |       |
| 2   | prisma/schema/clients.prisma                  |    21 |       |
| 3   | prisma/schema/attendance.prisma               |    24 |       |
| 4   | prisma/schema/notifications.prisma            |    31 | `deletedAt` commented out |
| 5   | prisma/schema/summary-reports.prisma          |    39 | `deletedAt` commented out |
| 6   | prisma/schema/parameter-limit-profiles.prisma |    41 |       |
| 7   | prisma/schema/chemicals.prisma                |    42 |       |
| 8   | prisma/schema/parameters.prisma               |    45 |       |
| 9   | prisma/schema/machines.prisma                 |    46 |       |
| 10  | prisma/schema/users.prisma                    |    62 |       |
| 11  | prisma/schema/work-reports.prisma             |    72 |       |
| 12  | prisma/schema/lab-analyses.prisma             |    80 |       |
| 13  | prisma/schema/projects.prisma                 |   118 |       |
| 14  | prisma/schema/log-sheets.prisma               |   125 |       |

---

## 5. Potential Schema Issues / Tech Debt

| File | Issue | Description |
| ---- | ----- | ----------- |
| notifications.prisma | Standardization | `deletedAt` present in schema but commented out to avoid migration impact. |
| summary-reports.prisma | Standardization | `deletedAt` present in schema but commented out to avoid migration impact. |

---

## 6. Baseline Comparison (Snapshot)

```
┌──────────────────────────────┬──────────┐
│ Metric                       │ Baseline │
├──────────────────────────────┼──────────┤
│ Total LOC (prisma)           │      758 │
│ File count                   │       14 │
│ Max file size (LOC)          │      125 │
│ Total Models                 │       23 │
│ Complexity Score             │      Low │
│ Duplicated code blocks       │        0 │
└──────────────────────────────┴──────────┘
```
