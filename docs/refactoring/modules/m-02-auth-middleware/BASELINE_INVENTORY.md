# M-02: Auth & Middleware — Baseline Inventory

> Snapshot: 2026-03-04 (Post-Refactor Update)

---

## 1. Summary Dashboard

| Metric                       | Before | After | Change |
| ---------------------------- | -----: | ----: | -----: |
| Total Lines of Code (ts/tsx) |    635 |   802 |   +167 |
| Code Files (.ts/.tsx)        |      6 |      9 |      +3 |
| Largest File (LOC)           |    232 |    232 |       0 |
| Files >500 lines             |      0 |      0 |       0 |
| Methods >50 lines            |      1 |      1 |       0 |
| TODO/FIXME/HACK Comments     |      0 |      0 |       0 |
| Est. Cyclomatic Complexity   | Medium |   Low |      -1 |
| Tests Passing                |     35 |    80+ |    +45 |

*Note: Code files now include src/features/auth/crypto.ts, src/features/auth/constants.ts, and src/features/users/utils.ts (shared).*

---

## 2. Lines of Code by File (sorted ascending)

| #   | File                             | Lines | Notes                                     |
| --- | -------------------------------- | ----: | ----------------------------------------- |
| 1   | src/features/auth/constants.ts   |    39 | Centralized auth constants                |
| 2   | src/features/auth/crypto.ts      |    46 | Password primitives (bcrypt)              |
| 3   | src/features/users/utils.ts      |    58 | Shared user mappers & guards              |
| 4   | src/features/auth/actions.ts     |    71 | Server Actions (Login/Logout)             |
| 5   | src/middleware.ts                |    76 | Next.js Middleware                        |
| 6   | src/lib/jwt.ts                   |    80 | JWT utilities (jose)                      |
| 7   | src/features/auth/service.ts     |    82 | Auth business logic                       |
| 8   | src/lib/auth-helpers.ts          |   118 | Shared session helpers                    |
| 9   | src/lib/rbac.ts                  |   232 | RBAC Matrix & Logic                       |

---

## 3. Largest Files (>500 lines)

| File | Lines | Functions | Description |
| ---- | ----: | :-------: | ----------- |
| None |     0 |     0     |             |

---

## 4. Longest Methods (>50 lines)

| #   | File              | Method     | Lines | Notes                                     |
| --- | ----------------- | ---------- | ----: | ----------------------------------------- |
| 1   | src/middleware.ts | middleware |    58 | Contains multiple redirection branches    |

---

## 5. Cyclomatic Complexity Hotspots

| File             | Est. CC | Hotspots                                      |
| ---------------- | ------: | --------------------------------------------- |
| src/middleware.ts | Medium  | Complex nested if-else for auth/rbac routing |
| src/lib/rbac.ts  | Medium  | Large switch/if-else in `matchPathToResource` |

---

## 6. Baseline Comparison (Snapshot)

```
┌──────────────────────────────┬──────────┐
│ Metric                       │ Post-Ref │
├──────────────────────────────┼──────────┤
│ Total LOC (ts/tsx)           │      802 │
│ File count                   │       11 │
│ Max file size                │      232 │
│ Max method size              │       58 │
│ Total cyclomatic complexity  │      Low │
│ Duplicated code blocks       │     None │
└──────────────────────────────┴──────────┘
```
