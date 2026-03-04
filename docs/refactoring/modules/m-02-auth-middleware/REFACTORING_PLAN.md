# M-02: Auth & Middleware — Refactoring Plan

The Auth & Middleware module currently provides a functional security layer but suffers from high-risk "Open-by-Default" routing, a monolithic master-data permission set, and a circular dependency between feature services and library helpers. This plan standardizes the security posture and decouples the layers.

---

## 1. Refactoring Priority Matrix

Priority = f(Pain, Risk, Value)

| Area | Pain Level | Risk Level | Business Value | Priority | Evidence |
| --- | --- | --- | --- | :---: | --- |
| Middleware Security | Low | High | Critical | **P1** | Open-by-default for unknown paths; API bypass. |
| RBAC Granularity | Medium | High | High | **P2** | Four domains grouped into one `MASTER_DATA` resource. |
| Dependency Coupling | High | Medium | Medium | **P3** | Circular dependency: `service` <-> `auth-helpers`. |
| Code Duplication | Low | Low | Low | **P4** | Token verification try-catch repeated in 2 files. |

---

## 2. Refactoring Order Rationale

> **LOW risk → MEDIUM risk → HIGH risk**

1. **Step 1: Isolated Utilities (JWT)** - Minor cleanup, no logic changes.
2. **Step 2: Feature Layer (Service/Actions)** - Resolve circular dependencies by moving password logic to a pure domain helper.
3. **Step 3: RBAC Core** - Split `MASTER_DATA` into granular resources and fix prefix matching.
4. **Step 4: Middleware Guard** - The final "High Risk" step: switch to "Closed-by-Default" and parameterize landing pages.

---

## 3. Testing Strategy

### What to test first

| Priority | What | Why | Type |
| :---: | --- | --- | --- |
| 1 | `canAccess` Matrix | High fan-out; ensures existing roles don't lose access. | Unit |
| 2 | Middleware Redirects | Security guard; ensures no regressions in guest protection. | Unit/Mock |
| 3 | E2E Login Flow | Critical user journey; ensures users can still enter the system. | E2E |

---

## 4. Phased Execution

### Phase 1: Foundation & Service Cleanup (F4, F5, F6)

- [x] **src/lib/jwt.ts**: Refactored secret handling into `getEncodedSecret()` helper; added full characterization tests.
- [x] **src/lib/jwt.ts**: Implemented runtime payload validation using Zod (`jwtPayloadSchema`).
- [x] **src/lib/jwt.ts**: Centralized JWT configuration and magic strings in `src/features/auth/constants.ts`.
- [x] **src/lib/jwt.ts**: Implemented memoization for encoded JWT secret to improve performance.
- [x] **src/features/auth/service.ts**: Standardized user data transformation via `toUserResponse` and `userResponseSelect`.
- [x] **src/features/auth/service.ts**: Prevented timing/enumeration attacks via `FAKE_PASSWORD_HASH` and generic errors.
- [x] **src/features/auth/service.ts**: Centralized user status validation via `isUserAuthValid` guard.
- [x] **src/features/auth/service.ts**: Removed direct dependency on `auth-helpers` for core logic.
- [x] **src/features/auth/actions.ts**: Extracted cookie configuration and session management to centralized helpers (`src/lib/auth-helpers.ts`) and constants.
- [x] **src/features/auth/actions.ts**: Centralized all route paths into `AUTH_ROUTES` constant to eliminate magic strings and reduce feature coupling.
- [x] **src/features/auth/actions.ts**: Centralized all UI feedback strings (Indonesian) into `SUCCESS_MESSAGES` and `ERROR_MESSAGES` constants.
- [x] **src/features/auth/actions.ts**: Decoupled feature-specific cache revalidation (`/users`) from the authentication lifecycle.
- [ ] **Tests**: Fix test mocks in `src/features/auth/__tests__` and `src/lib/__tests__` to match new Zod schemas in `src/features/users/utils.ts`.

### Phase 2: RBAC Granularity (F1)

- [ ] **src/lib/rbac.ts**: Split `MASTER_DATA` into `CLIENTS`, `CHEMICALS`, `PARAMETERS`, `MACHINES`.
- [ ] **src/lib/rbac.ts**: Refactor `matchPathToResource` to use an exact-match or segmented-match logic instead of `.startsWith()`.
- [ ] **src/lib/rbac.ts**: Implement `getLandingPage(role)` helper to replace hardcoded `/users` redirect.

### Phase 3: Middleware Hardening (F2)

- [ ] **src/middleware.ts**: Implement "Closed-by-Default" logic: if no resource matches, redirect to `/forbidden` (for auth users) or `/login` (for guests).
- [ ] **src/middleware.ts**: Use `getLandingPage(role)` for the post-auth redirect.
- [ ] **src/middleware.ts**: Remove implicit `/api` bypass; allow API routes to be handled by a common auth helper or registered in RBAC.

### Phase 4: Dependency Resolution (F3)

- [x] **src/lib/auth-helpers.ts**: Break circularity by moving shared password hashing/comparison to `src/features/auth/service.ts` and re-exporting.

---

## 5. Verification Plan

- [ ] All 62+ characterization tests pass (including 21 new ones).
- [ ] E2E Journey CUJ-01 (Login) passes.
- [ ] E2E Journey CUJ-03 (RBAC Guard) passes for newly split resources.
- [ ] `npx vitest run --coverage` maintains or improves on baseline (Stmts: 87%, Branch: 90%).
