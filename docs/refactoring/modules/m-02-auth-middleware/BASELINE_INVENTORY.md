# M-02: Auth & Middleware — Baseline Inventory

> Snapshot: 2026-03-07 (Re-Baseline Update)

---

## 1. Summary Dashboard

| Metric                       | Before | After | Change |
| ---------------------------- | -----: | ----: | -----: |
| Total Lines of Code (ts/tsx) |   1029 |  1096 |    +67 |
| Code Files (.ts/.tsx)        |     15 |    16 |    +1 |
| Largest File (LOC)           |    121 |    121 |      0 |
| Files >500 lines             |      0 |     0 |      0 |
| Methods >50 lines            |      0 |     0 |      0 |
| TODO/FIXME/HACK Comments     |      0 |     0 |      0 |
| Est. Cyclomatic Complexity   |    Low |   Low |      — |
| Tests Passing                |    105 |   126 |    +21 |

*Note: This baseline reflects the current refactored state, including modular RBAC policies, centralized action factories, and a project-wide structured logger. The total LOC includes both feature-specific logic and shared infrastructure helpers in `src/lib/`.*

---

## 2. Lines of Code by File (sorted ascending)

| #   | File                                  | Lines | Notes                                     |
| --- | ------------------------------------- | ----: | ----------------------------------------- |
| 1   | src/lib/rbac/policies/admin.policy.ts |    22 | Granular role permission set              |
| 2   | src/features/auth/constants.ts        |    39 | Auth domain constants                     |
| 3   | src/features/auth/lib/user-context.ts |    43 | React Context for User state (Refactored) |
| 4   | src/lib/rbac/types.ts                 |    46 | RBAC type definitions                     |
| 5   | src/lib/rbac/policies/client.policy.ts|    46 | Granular role permission set (Refactored) |
| 6   | src/lib/logger.ts                     |    49 | Structured Logger (New infrastructure)    |
| 7   | src/features/auth/crypto.ts           |    50 | Password primitives (Refactored)          |
| 8   | src/middleware.ts                     |    67 | Next.js Middleware                        |
| 9   | src/features/users/utils.ts           |    68 | Shared user mappers & guards (Hardened)   |
| 10  | src/features/auth/actions.ts          |    80 | Server Actions (Standardized)             |
| 11  | src/features/auth/service.ts          |    83 | Auth business logic (Hardened)            |
| 12  | src/lib/auth-helpers.ts               |    83 | Shared session helpers (Hardened)         |
| 13  | src/lib/rbac/policies/staff.policy.ts |    88 | Granular role permission set              |
| 14  | src/lib/jwt.ts                        |    96 | JWT utilities (jose)                      |
| 15  | src/lib/action-factory.ts             |   115 | Type-safe Server Action Factory           |
| 16  | src/lib/rbac.ts                       |   121 | Core RBAC Registry & Access Checks        |

---

## 3. Largest Files (>500 lines)

| File | Lines | Functions | Description |
| ---- | ----: | :-------: | ----------- |
| None |     0 |     0     |             |

---

## 4. Longest Methods (>50 lines)

| #   | File | Method | Lines | Notes |
| --- | ---- | ------ | ----: | ----- |
| None| -    | -      | -     | All methods are under 50 lines |

---

## 5. Cyclomatic Complexity Hotspots

| File             | Est. CC | Hotspots                                      |
| ---------------- | ------: | --------------------------------------------- |
| src/lib/rbac.ts  | Low     | Path matching logic (`matchPathToResource`)   |
| src/lib/jwt.ts   | Low     | Token verification & error handling           |

---

## 6. Baseline Comparison (Snapshot)

```
┌──────────────────────────────┬──────────┐
│ Metric                       │ Baseline │
├──────────────────────────────┼──────────┤
│ Total LOC (ts/tsx)           │     1096 │
│ File count                   │       16 │
│ Max file size                │      121 │
│ Max method size              │    < 40  │
│ Total cyclomatic complexity  │      Low │
│ Duplicated code blocks       │     None │
└──────────────────────────────┴──────────┘
```
