# M-02: Auth & Middleware — Baseline Inventory

> Snapshot: 2026-03-04

---

## 1. Summary Dashboard

| Metric                       | Before | After | Change |
| ---------------------------- | -----: | ----: | -----: |
| Total Lines of Code (ts/tsx) |    635 |   665 |     +30 |
| Code Files (.ts/.tsx)        |      6 |      6 |      0 |
| Largest File (LOC)           |    232 |    232 |      0 |
| Files >500 lines             |      0 |      0 |      0 |
| Methods >50 lines            |      1 |      1 |      0 |
| TODO/FIXME/HACK Comments     |      0 |      0 |      0 |
| Est. Cyclomatic Complexity   | Medium |   Low* | -1 (jwt) |
| Tests Passing                |     35 |     67 |    +32 |

---

## 2. Lines of Code by File (sorted ascending)

| #   | File                     | Lines | Notes                                     |
| --- | ------------------------ | ----: | ----------------------------------------- |
| 1   | src/lib/jwt.ts           |    51 | JWT utilities                             |
| 2   | src/features/auth/service.ts |    67 | Auth business logic                       |
| 3   | src/middleware.ts        |    76 | Next.js Middleware                        |
| 4   | src/features/auth/actions.ts |    84 | Server Actions (Login/Logout)             |
| 5   | src/lib/auth-helpers.ts  |   125 | Shared auth helpers                       |
| 6   | src/lib/rbac.ts          |   232 | RBAC Matrix & Logic                       |

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
│ Metric                       │ Baseline │
├──────────────────────────────┼──────────┤
│ Total LOC (ts/tsx)           │      635 │
│ File count                   │        6 │
│ Max file size                │      232 │
│ Max method size              │       58 │
│ Total cyclomatic complexity  │   Medium │
│ Duplicated code blocks       │      Low │
└──────────────────────────────┴──────────┘
```
