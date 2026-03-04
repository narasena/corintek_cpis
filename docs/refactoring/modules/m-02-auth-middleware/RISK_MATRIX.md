# M-02: Auth & Middleware — Risk Matrix

> Updated 2026-03-04 (Post-Refactor Update)

---

## Risk Classification Criteria

| Level     | Criteria                                                          |
| --------- | ----------------------------------------------------------------- |
| 🔴 HIGH   | Core business logic, heavily coupled, many dependents, god class  |
| 🟡 MEDIUM | Shared utilities/types, moderate coupling, cross-layer dependency |
| 🟢 LOW    | UI-only, isolated leaf module, few/no dependents                  |

---

## Risk Table

| ID | File | Lines | Risk | Reason |
| --- | --- | ---: | :--: | --- |
| F1 | src/lib/rbac.ts | 232 | 🔴 | **High Fan-out**: Imported by almost all features. Contains critical access control matrix. Complexity in path matching. Target for next refactor phase. |
| F2 | src/middleware.ts | 76 | 🔴 | **Security Guard**: Single point of failure for routing security. Contains complex sequential redirection logic. Target for next refactor phase. |
| F3 | src/lib/auth-helpers.ts | 91 | 🟡 | **Session Anchor**: Decoupled from core implementation. Now re-exports from auth service. Risk reduced from HIGH to MEDIUM after resolving circularity. |
| F4 | src/features/auth/service.ts | 82 | 🟢 | **Business Logic**: Now declarative and clean. Security mechanisms (timing/enumeration) encapsulated in utilities. Risk reduced from MEDIUM to LOW. |
| F5 | src/features/auth/actions.ts | 81 | 🟡 | **Entry Point**: Public server actions. Manages cookies and cache revalidation. |
| F6 | src/features/auth/crypto.ts | 46 | 🟢 | **Isolated Util**: Pure wrapper around 'bcrypt' and timing normalization. High test coverage. |
| F7 | src/lib/jwt.ts | 80 | 🟢 | **Isolated Util**: Pure wrapper around 'jose'. Stable API, low complexity. |

---

## Summary

| Risk Level | Count | Files |
| :--------: | :---: | ----- |
|  🔴 HIGH   |   2   | rbac.ts, middleware.ts |
| 🟡 MEDIUM  |   2   | auth-helpers.ts, actions.ts |
|   🟢 LOW   |   3   | service.ts, crypto.ts, jwt.ts |
