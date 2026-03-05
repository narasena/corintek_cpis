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
| Code Duplication | Low | Low | Low | **DONE** | Eliminated local `requireActor` via `actionFactory`. |

---

## 2. Refactoring Order Rationale

> **LOW risk → MEDIUM risk → HIGH risk**

1. **Step 1: Isolated Utilities (JWT)** - Minor cleanup, no logic changes.
2. **Step 2: Feature Layer (Service/Actions)** - Resolve circular dependencies by moving password logic to a pure domain helper.
3. **Step 3: RBAC Core** - Split `MASTER_DATA` into granular resources, fix prefix matching, and unify role metadata.
4. **Step 4: Middleware Guard** - [x] Consolidate identity resolution, implement 'Closed-by-Default' logic, parameterize landing pages, and enforce mandatory role-based authorization.
5. **Step 5: Action Abstraction** - [x] Implement `actionFactory` to centralize Server Action security, validation, and error handling.

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
- [x] **Tests**: Verified that core auth and characterization tests pass (64 tests total). Fixed test mocks in `src/features/auth/__tests__` and `src/lib/__tests__` to match new Zod schemas.

### Phase 2: RBAC Granularity (F1)

- [x] **src/lib/rbac.ts**: Split `MASTER_DATA` into `CLIENTS`, `CHEMICALS`, `PARAMETERS`, `MACHINES`.
- [x] **src/lib/rbac.ts**: Refactor `matchPathToResource` to use an exact-match or segmented-match logic instead of `.startsWith()`.
- [x] **src/lib/rbac.ts**: Unify role metadata (labels and permissions) into a single `ROLE_CONFIG` object.
- [x] **src/lib/rbac.ts**: Implement `getLandingPage(role)` helper to replace hardcoded `/users` redirect.
- [x] **src/lib/rbac.ts**: Implement "Closed-by-Default" security posture for navigation and path matching.

### Phase 3: Middleware Hardening (F2)

- [x] **src/middleware.ts**: Implement "Closed-by-Default" logic: if no resource matches, redirect to `/forbidden` (for auth users) or `/login` (for guests).
- [x] **src/middleware.ts**: Use `getLandingPage(role)` for the post-auth redirect.
- [x] **src/middleware.ts**: Remove implicit `/api` bypass; allow API routes to be handled by a common auth helper or registered in RBAC.
- [x] **src/middleware.ts**: Enforce mandatory role-based authorization for all authenticated requests; authenticated users without a role are denied access.

### Phase 4: Dependency Resolution (F3)

- [x] **src/lib/auth-helpers.ts**: Break circularity by moving shared password hashing/comparison to `src/features/auth/service.ts` and re-exporting.

### Phase 5: Action Abstraction (F7)

- [x] **src/lib/action-factory.ts**: Implement type-safe Server Action factory with centralized Auth, RBAC, and Validation.
- [x] **src/features/dashboard/actions.ts**: Migrate all dashboard actions to the factory.
- [x] **src/features/log-sheets/actions.ts**: Migrate all log-sheet actions to the factory.
- [x] **src/features/log-sheets/actions.characterization.test.ts**: Update characterization tests to verify the new factory integration.

---

## 5. Verification Plan

- [x] All 62+ characterization tests pass (64 verified in core auth/rbac/jwt + 48 in log-sheets).
- [ ] E2E Journey CUJ-01 (Login) passes.
- [ ] E2E Journey CUJ-03 (RBAC Guard) passes for newly split resources.
- [ ] `npx vitest run --coverage` maintains or improves on baseline (Stmts: 87%, Branch: 90%).
