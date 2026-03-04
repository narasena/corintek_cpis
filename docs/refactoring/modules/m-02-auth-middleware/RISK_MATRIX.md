# M-02: Auth & Middleware — Risk Matrix

> Updated 2026-03-04

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
| F1 | src/lib/rbac.ts | 232 | 🔴 | **High Fan-out**: Imported by almost all features. Contains critical access control matrix. Complexity in path matching. |
| F2 | src/middleware.ts | 76 | 🔴 | **Security Guard**: Single point of failure for routing security. Contains complex sequential redirection logic. |
| F3 | src/lib/auth-helpers.ts | 125 | 🔴 | **Session Anchor**: Used for all server-side session checks. High cross-module impact. Part of a circular dependency. |
| F4 | src/features/auth/service.ts | 67 | 🟡 | **Business Logic**: Core authentication logic. Coupled to Prisma and auth-helpers. |
| F5 | src/features/auth/actions.ts | 84 | 🟡 | **Entry Point**: Public server actions. Manages cookies and cache revalidation. |
| F6 | src/lib/jwt.ts | 51 | 🟢 | **Isolated Util**: Pure wrapper around 'jose'. Stable API, low complexity. |

---

## Summary

| Risk Level | Count | Files |
| :--------: | :---: | ----- |
|  🔴 HIGH   |   3   | rbac.ts, middleware.ts, auth-helpers.ts |
| 🟡 MEDIUM  |   2   | service.ts, actions.ts |
|   🟢 LOW   |   1   | jwt.ts |
