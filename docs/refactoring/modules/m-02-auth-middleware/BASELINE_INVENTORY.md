# M-02: Auth & Middleware — Baseline Inventory

> Snapshot: 2026-03-05 (Post-Refactor Update)

---

## 1. Summary Dashboard

| Metric                       | Before | After | Change |
| ---------------------------- | -----: | ----: | -----: |
| Total Lines of Code (ts/tsx) |    635 |   856 |   +221 |
| Code Files (.ts/.tsx)        |      6 |     10 |      +4 |
| Largest File (LOC)           |    232 |    294 |    +62 |
| Files >500 lines             |      0 |      0 |       0 |
| Methods >50 lines            |      1 |      0 |      -1 |
| TODO/FIXME/HACK Comments     |      0 |      0 |       0 |
| Est. Cyclomatic Complexity   | Medium |   Low |      -1 |
| Tests Passing                |     35 |   112 |    +77 |

*Note: Code files now include src/lib/action-factory.ts, src/features/auth/crypto.ts, src/features/auth/constants.ts, and src/features/users/utils.ts (shared). The RBAC matrix in src/lib/rbac.ts has grown due to more granular definitions.*

---

## 2. Lines of Code by File (sorted ascending)

| #   | File                             | Lines | Notes                                     |
| --- | -------------------------------- | ----: | ----------------------------------------- |
| 1   | src/features/auth/constants.ts   |    39 | Centralized auth constants                |
| 2   | src/features/auth/crypto.ts      |    46 | Password primitives (bcrypt)              |
| 3   | src/features/users/utils.ts      |    59 | Shared user mappers & guards              |
| 4   | src/middleware.ts                |    67 | Next.js Middleware (Refactored)           |
| 5   | src/lib/action-factory.ts        |    82 | Type-safe Server Action Factory           |
| 6   | src/features/auth/actions.ts     |    71 | Server Actions (Login/Logout)             |
| 7   | src/lib/jwt.ts                   |    80 | JWT utilities (jose)                      |
| 8   | src/features/auth/service.ts     |    82 | Auth business logic                       |
| 9   | src/lib/auth-helpers.ts          |   118 | Shared session helpers                    |
| 10  | src/lib/rbac.ts                  |   294 | RBAC Matrix & Logic (Expanded)            |

---

## 3. Largest Files (>500 lines)

| File | Lines | Functions | Description |
| ---- | ----: | :-------: | ----------- |
| None |     0 |     0     |             |

---

## 4. Longest Methods (>50 lines)

| #   | File              | Method     | Lines | Notes                                     |
| --- | ----------------- | ---------- | ----: | ----------------------------------------- |
| None| -                 | -          | -     | All methods are now under 50 lines        |

---

## 5. Cyclomatic Complexity Hotspots

| File             | Est. CC | Hotspots                                      |
| ---------------- | ------: | --------------------------------------------- |
| src/lib/rbac.ts  | Medium  | Large registry in `ROLE_CONFIG`               |

---

## 6. Baseline Comparison (Snapshot)

```
┌──────────────────────────────┬──────────┐
│ Metric                       │ Post-Ref │
├──────────────────────────────┼──────────┤
│ Total LOC (ts/tsx)           │      856 │
│ File count                   │        9 │
│ Max file size                │      294 │
│ Max method size              │    < 40  │
│ Total cyclomatic complexity  │      Low │
│ Duplicated code blocks       │     None │
└──────────────────────────────┴──────────┘
```
