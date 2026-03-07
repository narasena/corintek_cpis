# M-01: Database Schema — Baseline Inventory

> Snapshot: 2026-03-07

---

## 1. Summary Dashboard

| Metric                       | Before | After | Change |
| ---------------------------- | -----: | ----: | -----: |
| Total Lines of Code (prisma) |    758 |     0 |      — |
| Code Files (.prisma)         |     14 |     0 |      — |
| Largest File (LOC)           |    125 |     0 |      — |
| Files >500 lines             |      0 |     0 |      — |
| Total Models                 |     23 |     0 |      — |
| TODO/FIXME/HACK Comments     |      0 |     0 |      — |
| Est. Complexity Score        |    Low |     0 |      — |
| Tests Passing                |    N/A |     0 |      — |

---

## 2. Lines of Code by File (sorted ascending)

| #   | File                                          | Lines | Notes |
| --- | --------------------------------------------- | ----: | ----- |
| 1   | prisma/schema/schema.prisma                   |    12 |       |
| 2   | prisma/schema/clients.prisma                  |    21 |       |
| 3   | prisma/schema/attendance.prisma               |    24 |       |
| 4   | prisma/schema/notifications.prisma            |    31 |       |
| 5   | prisma/schema/summary-reports.prisma          |    39 |       |
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

## 3. Largest Files (>500 lines)

| File | Lines | Models | Description |
| ---- | ----: | :----: | ----------- |
| None |     0 |   0    |             |

---

## 4. Models by File

| #   | File                                          | Models |
| --- | --------------------------------------------- | -----: |
| 1   | prisma/schema/attendance.prisma               |      1 |
| 2   | prisma/schema/chemicals.prisma                |      2 |
| 3   | prisma/schema/clients.prisma                  |      1 |
| 4   | prisma/schema/lab-analyses.prisma             |      3 |
| 5   | prisma/schema/log-sheets.prisma               |      4 |
| 6   | prisma/schema/machines.prisma                 |      1 |
| 7   | prisma/schema/notifications.prisma            |      1 |
| 8   | prisma/schema/parameter-limit-profiles.prisma |      2 |
| 9   | prisma/schema/parameters.prisma               |      1 |
| 10  | prisma/schema/projects.prisma                 |      3 |
| 11  | prisma/schema/schema.prisma                   |      0 |
| 12  | prisma/schema/summary-reports.prisma          |      1 |
| 13  | prisma/schema/users.prisma                    |      1 |
| 14  | prisma/schema/work-reports.prisma             |      2 |

---

## 5. Potential Schema Issues / Tech Debt

| File | Issue | Description |
| ---- | ----- | ----------- |
| All  | Multi-file schema | Split schemas must be managed with care; ensures separation but increases relation complexity. |
| All  | Relations | High number of cross-schema relations to manage across 14 files. |

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
