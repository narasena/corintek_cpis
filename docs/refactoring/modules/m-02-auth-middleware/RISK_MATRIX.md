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
| F1   | src/lib/rbac.ts                       |   121 |  🔴  | **RBAC Engine**: Central source of truth for all access control.        |
| F2   | src/middleware.ts                     |    67 |  🔴  | **Security Perimeter**: Global entry point for all requests.            |
| F3   | src/lib/jwt.ts                        |    96 |  🔴  | **Token Handler**: Handles crypto, secret retrieval, and verification. |
| F4   | src/lib/action-factory.ts             |   111 |  🔴  | **Action Guard**: Injected into every feature action in the system.    |
| F5   | src/features/auth/service.ts          |    82 |  🟡  | **Domain Service**: Core login logic, interacts with Prisma.           |
| F6   | src/lib/auth-helpers.ts               |    72 |  🟡  | **Session Helper**: Shared session/cookie management.                  |
| F7   | src/features/auth/actions.ts          |    71 |  🟡  | **Server Actions**: Public API for auth, complex cache/redirect flows. |
| F8   | src/features/auth/crypto.ts           |    46 |  🟡  | **Crypto Lib**: Bcrypt primitives, risk of timing attacks if broken.   |
| F9   | src/features/auth/lib/user-context.ts |    59 |  🟡  | **Identity Context**: Critical for RSC-level identity resolution.      |
| F10  | src/features/users/utils.ts           |    59 |  🟡  | **Auth Status**: Central logic for blocked/inactive/deleted accounts.  |
| F11  | src/lib/rbac/policies/*.ts            |   164 |  🟡  | **Domain Policies**: Configuration for role-specific access.           |
| F12  | src/features/auth/constants.ts        |    35 |  🟢  | **Domain Constants**: Hardcoded routes and error messages.             |
| F13  | src/lib/rbac/types.ts                 |    46 |  🟢  | **Types**: Shared interfaces for RBAC, low runtime risk.              |

---

## Summary

| Risk Level | Count | Files |
| :--------: | :---: | ----- |
|  🔴 HIGH   |   4   | `rbac.ts`, `middleware.ts`, `jwt.ts`, `action-factory.ts` |
| 🟡 MEDIUM  |   7   | `service.ts`, `auth-helpers.ts`, `actions.ts`, `crypto.ts`, `user-context.ts`, `utils.ts`, `policies/*.ts` |
|   🟢 LOW   |   2   | `constants.ts`, `types.ts` |
