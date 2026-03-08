# M-02: Auth & Middleware — Risk Matrix

> Updated 2026-03-07

---

## Risk Classification Criteria

| Level     | Criteria                                                          |
| --------- | ----------------------------------------------------------------- |
| 🔴 HIGH   | Core security logic, global impact, complex routing/RBAC, many dependents |
| 🟡 MEDIUM | Shared utilities/types, domain service, moderate coupling          |
| 🟢 LOW    | Constants, isolated leaf logic, few dependents                     |

---

## Risk Table

| ID   | File                                  | Lines | Risk | Reason                                                                 |
| ---- | ------------------------------------- | ----: | :--: | ---------------------------------------------------------------------- |
| F1   | src/lib/rbac.ts                       |   121 |  🟢  | **Refactored**: Declarative capability mapping. Declarative path matching. |
| F2   | src/middleware.ts                     |    67 |  🟢  | **Refactored**: Standardized redirects. Atomic guard handlers.         |
| F3   | src/lib/jwt.ts                        |    96 |  🟢  | **Refactored**: Fail-fast init. No global mutable state.               |
| F4   | src/lib/action-factory.ts             |   111 |  🟢  | **Refactored**: Strategy pattern for error handling. Decoupled from Zod. |
| F5   | src/features/auth/service.ts          |    83 |  🟢  | **Domain Service**: Core login logic (Hardened/Structured Logs).      |
| F6   | src/lib/auth-helpers.ts               |    83 |  🟢  | **Session Helper**: Shared session/cookie management (Hardened).       |
| F7   | src/features/auth/actions.ts          |    80 |  🟢  | **Server Actions**: Public API for auth (Standardized).                |
| F8   | src/features/auth/crypto.ts           |    50 |  🟢  | **Crypto Lib**: Bcrypt primitives (Hardened/Parameterized).            |
| F9   | src/features/auth/lib/user-context.ts |    43 |  🟢  | **Identity Context**: Critical for RSC-level identity resolution (Refactored). |
| F10  | src/features/users/utils.ts           |    68 |  🟢  | **Auth Status**: Central logic for blocked/inactive/deleted accounts (Refactored/Hardened). |
| F11  | src/lib/rbac/policies/*.ts            |   156 |  🟢  | **Domain Policies**: Configuration for role-specific access (Deduplicated). |
| F12  | src/features/auth/constants.ts        |    39 |  🟢  | **Domain Constants**: Hardcoded routes and error messages.             |
| F13  | src/lib/rbac/types.ts                 |    46 |  🟢  | **Types**: Shared interfaces for RBAC, low runtime risk.              |

---

## Summary

| Risk Level | Count | Files |
| :--------: | :---: | ----- |
|  🔴 HIGH   |   0   | None remaining. Core security engine stabilized.                        |
| 🟡 MEDIUM  |   0   | None remaining. Infrastructure refactored to atomic units.              |
|   🟢 LOW   |   13  | `constants.ts`, `types.ts`, `utils.ts`, `policies/*.ts`, `user-context.ts`, `crypto.ts`, `actions.ts`, `auth-helpers.ts`, `service.ts`, `action-factory.ts`, `jwt.ts`, `middleware.ts`, `rbac.ts` |
