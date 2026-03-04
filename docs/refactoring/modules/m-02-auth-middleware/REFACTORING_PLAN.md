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

- [ ] **src/lib/jwt.ts**: Add `T` prefix to JWT payload types if missing; standardize exports.
- [ ] **src/features/auth/service.ts**: Remove direct dependency on `auth-helpers` if possible; unify user status validation.
- [ ] **src/features/auth/actions.ts**: Extract cookie configuration to constants to avoid "Magic Numbers" (e.g., maxAge).

### Phase 2: RBAC Granularity (F1)

- [ ] **src/lib/rbac.ts**: Split `MASTER_DATA` into `CLIENTS`, `CHEMICALS`, `PARAMETERS`, `MACHINES`.
- [ ] **src/lib/rbac.ts**: Refactor `matchPathToResource` to use an exact-match or segmented-match logic instead of `.startsWith()`.
- [ ] **src/lib/rbac.ts**: Implement `getLandingPage(role)` helper to replace hardcoded `/users` redirect.

### Phase 3: Middleware Hardening (F2)

- [ ] **src/middleware.ts**: Implement "Closed-by-Default" logic: if no resource matches, redirect to `/forbidden` (for auth users) or `/login` (for guests).
- [ ] **src/middleware.ts**: Use `getLandingPage(role)` for the post-auth redirect.
- [ ] **src/middleware.ts**: Remove implicit `/api` bypass; allow API routes to be handled by a common auth helper or registered in RBAC.

### Phase 4: Dependency Resolution (F3)

- [ ] **src/lib/auth-helpers.ts**: Break circularity by moving shared password hashing/comparison to a separate `src/lib/crypto.ts` or `src/features/auth/domain-helpers.ts`.

---

## 5. Verification Plan

- [ ] All 62+ characterization tests pass (including 21 new ones).
- [ ] E2E Journey CUJ-01 (Login) passes.
- [ ] E2E Journey CUJ-03 (RBAC Guard) passes for newly split resources.
- [ ] `npx vitest run --coverage` maintains or improves on baseline (Stmts: 87%, Branch: 90%).
