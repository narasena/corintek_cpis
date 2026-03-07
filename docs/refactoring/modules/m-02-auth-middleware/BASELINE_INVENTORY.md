# M-02: Auth & Middleware — Baseline Inventory

> Snapshot: 2026-03-07 (Re-Baseline Update)

---

## 1. Summary Dashboard

| Metric                       | Before | After | Change |
| ---------------------------- | -----: | ----: | -----: |
| Total Lines of Code (ts/tsx) |   1029 |     — |      — |
| Code Files (.ts/.tsx)        |     15 |     — |      — |
| Largest File (LOC)           |    121 |     — |      — |
| Files >500 lines             |      0 |     — |      — |
| Methods >50 lines            |      0 |     — |      — |
| TODO/FIXME/HACK Comments     |      0 |     — |      — |
| Est. Cyclomatic Complexity   |    Low |     — |      — |
| Tests Passing                |    105 |     — |      — |

*Note: This baseline reflects the current refactored state, including modular RBAC policies and centralized action factories. The total LOC includes both feature-specific logic and shared infrastructure helpers in `src/lib/`.*

---

## 2. Lines of Code by File (sorted ascending)

| #   | File                                  | Lines | Notes                                     |
| --- | ------------------------------------- | ----: | ----------------------------------------- |
| 1   | src/lib/rbac/policies/admin.policy.ts |    22 | Granular role permission set              |
| 2   | src/features/auth/constants.ts        |    35 | Auth domain constants                     |
| 3   | src/lib/rbac/types.ts                 |    46 | RBAC type definitions                     |
| 4   | src/features/auth/crypto.ts           |    46 | Password primitives (bcrypt)              |
| 5   | src/lib/rbac/policies/client.policy.ts|    54 | Granular role permission set              |
| 6   | src/features/auth/lib/user-context.ts |    59 | React Context for User state              |
| 7   | src/features/users/utils.ts           |    59 | Shared user mappers & guards              |
| 8   | src/middleware.ts                     |    67 | Next.js Middleware                        |
| 9   | src/features/auth/actions.ts          |    71 | Server Actions (Login/Logout)             |
| 10  | src/lib/auth-helpers.ts               |    72 | Shared session helpers                    |
| 11  | src/features/auth/service.ts          |    82 | Auth business logic                       |
| 12  | src/lib/rbac/policies/staff.policy.ts |    88 | Granular role permission set              |
| 13  | src/lib/jwt.ts                        |    96 | JWT utilities (jose)                      |
| 14  | src/lib/action-factory.ts             |   111 | Type-safe Server Action Factory           |
| 15  | src/lib/rbac.ts                       |   121 | Core RBAC Registry & Access Checks        |

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
│ Total LOC (ts/tsx)           │     1029 │
│ File count                   │       15 │
│ Max file size                │      121 │
│ Max method size              │    < 40  │
│ Total cyclomatic complexity  │      Low │
│ Duplicated code blocks       │     None │
└──────────────────────────────┴──────────┘
```
