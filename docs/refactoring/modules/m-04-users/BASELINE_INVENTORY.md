# M-04: Users — Baseline Inventory

> Snapshot: 2026-03-08

<!-- PROMPT FOR AI AGENT:
"Phase 1 (Baseline): Create an inventory of the current module:
- Total lines of code
- Number of files/classes
- Largest files (>500 lines)
- Longest methods (>50 lines)
- Estimated cyclomatic complexity score
- Number of TODO/FIXME comments
Fill the 'Before' column. This is our baseline.

Phase 6 (Verify): After refactoring is complete, re-run all metrics
and fill the 'After' column. Calculate the 'Change' column.
This proves the refactoring improved the codebase."
-->

---

## 1. Summary Dashboard

| Metric                       | Before | After | Change |
| ---------------------------- | -----: | ----: | -----: |
| Total Lines of Code (ts/tsx) |   1296 |  1309 |    +13 |
| Code Files (.ts/.tsx)        |      7 |     9 |     +2 |
| Largest File (LOC)           |    417 |   403 |    -14 |
| Files >500 lines             |      0 |     0 |      — |
| Methods >50 lines            |      2 |     2 |      — |
| TODO/FIXME/HACK Comments     |      0 |     0 |      — |
| Est. Cyclomatic Complexity   |   ~5-8 |  ~3-5 |     ↓  |
| Tests Passing                |     11 |    54 |    +43 |

---

## 2. Lines of Code by File (sorted ascending)

| #   | File                                       | Lines | Notes                                      |
| --- | ------------------------------------------ | ----: | ------------------------------------------ |
| 1   | `src/features/users/service.ts`            |     9 | Facade re-exporting services               |
| 2   | `src/features/users/hooks/use-user-clients.ts`|    28 | Extracted hook for client fetching         |
| 3   | `src/features/users/components/user-dialog.tsx` |    46 | Simple wrapper dialog                      |
| 4   | `src/features/users/utils.ts`              |    68 | Prisma select and simple transformation    |
| 5   | `src/features/users/services/user-queries.ts` |   119 | Decomposed: Focused on Read operations     |
| 6   | `src/features/users/actions.ts`            |   159 | Standardized revalidation paths            |
| 7   | `src/features/users/components/profile-form.tsx` |   231 | Consistent error handling pattern          |
| 8   | `src/features/users/services/user-mutations.ts`|   255 | Decomposed: Focused on Write operations    |
| 9   | `src/features/users/components/user-form.tsx` |   403 | God Component (Shrinking)                  |


---

## 3. Largest Files (>500 lines)

| File | Lines | Functions | Description |
| ---- | ----: | :-------: | ----------- |
| None |     0 |     0     |             |

---

## 4. Longest Methods (>50 lines)

| #   | File                                  | Method     | Lines | Notes                                                                 |
| --- | ------------------------------------- | ---------- | ----: | --------------------------------------------------------------------- |
| 1   | `src/features/users/service.ts`       | `updateUser` |    54 | Contains complex uniqueness checks and conditional password hashing.  |
| 2   | `src/features/users/components/user-form.tsx` | `UserForm` |   ~300 | Component body + JSX is large; should be split into smaller sub-components. |

---

## 5. Cyclomatic Complexity Hotspots

| File                                  | Est. CC | Hotspots                                                                 |
| ------------------------------------- | ------: | ------------------------------------------------------------------------ |
| `src/features/users/components/user-form.tsx` |     15 | Many conditional branches based on `mode` and `isClientRole`.           |
| `src/features/users/service.ts`       |      12 | `updateUser` and `createUser` have multiple guard clauses and OR queries. |

---

## 6. Baseline Comparison (Snapshot)

```
┌──────────────────────────────┬──────────┐
│ Metric                       │ Baseline │
├──────────────────────────────┼──────────┤
│ Total LOC (ts/tsx)           │     1296 │
│ File count                   │        7 │
│ Max file size                │      417 │
│ Max method size              │       54 │
│ Total cyclomatic complexity  │     ~40  │
│ Duplicated code blocks       │      low │
└──────────────────────────────┴──────────┘
```

## 7. Preliminary Findings

- **Test Gap:** Existing tests (`service.test.ts`, `actions.test.ts`) only cover profile-related functionality. Core administrative CRUD operations are currently untested.
- **Complexity Hotspot:** `UserForm` is a large "God component" that handles both creation and editing, leading to many conditional paths.
- **Redundant Services:** Separation between `service.ts` and `service-admin.ts` is minimal; logic could be consolidated or more clearly partitioned.
- **Mocking Issues:** `actions.test.ts` fails due to environment variable requirements during mocking (JWT_SECRET), suggesting tight coupling in the auth infrastructure.
