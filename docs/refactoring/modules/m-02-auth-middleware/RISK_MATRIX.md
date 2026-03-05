# M-02: Auth & Middleware — Risk Matrix

> Updated 2026-03-05 (Post-Refactor Update)

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
| F1 | src/lib/rbac.ts | 294 | 🟢 | **RBAC Core**: Fully refactored to declarative registry. Path matching, granular resources, role metadata, and "Closed-by-Default" logic complete. Risk reduced from HIGH to LOW. |
| F2 | src/middleware.ts | 67 | 🟢 | **Security Guard**: Refactored to a declarative orchestration layer. Redundant path logic removed; identity resolution isolated. High test coverage. Risk reduced from 🔴 HIGH to 🟢 LOW. |
| F3 | src/lib/auth-helpers.ts | 118 | 🟡 | **Session Anchor**: Decoupled from core implementation. Now re-exports from auth service. Risk reduced from HIGH to MEDIUM. |
| F4 | src/features/auth/service.ts | 82 | 🟢 | **Business Logic**: Now declarative and clean. Security mechanisms (timing/enumeration) encapsulated. Risk reduced from MEDIUM to LOW. |
| F5 | src/features/auth/actions.ts | 71 | 🟡 | **Entry Point**: Public server actions. Manages cookies and cache revalidation. |
| F6 | src/features/auth/crypto.ts | 46 | 🟢 | **Isolated Util**: Pure wrapper around 'bcrypt' and timing normalization. High test coverage. |
| F7 | src/lib/jwt.ts | 80 | 🟢 | **Isolated Util**: Pure wrapper around 'jose'. Stable API, low complexity. |
| F8 | src/features/users/utils.ts | 59 | 🟢 | **Shared Logic**: Centralized user status and response mapping. High reuse, low complexity. |

---

## Summary

| Risk Level | Count | Files |
| :--------: | :---: | ----- |
|  🔴 HIGH   |   0   | - |
| 🟡 MEDIUM  |   2   | auth-helpers.ts, actions.ts |
|   🟢 LOW   |   6   | rbac.ts, middleware.ts, service.ts, crypto.ts, jwt.ts, users/utils.ts |
