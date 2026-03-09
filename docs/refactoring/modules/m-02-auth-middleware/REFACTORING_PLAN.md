# M-02: Auth & Middleware — Refactoring Plan (Phase 2 Hardening)

> Updated: 2026-03-07

The Auth & Middleware module is currently in a "Verified" state with 97%+ coverage. This hardening plan addresses minor inconsistencies and "surprising behaviors" discovered during the re-baseline characterization phase to ensure absolute production readiness.

---

## 1. Refactoring Priority Matrix

Priority = f(Pain, Risk, Value)

| Area | Pain Level | Risk Level | Business Value | Priority | Evidence |
| ---- | ---------- | ---------- | -------------- | :------: | -------- |
| Error Consistency | Medium | Low | Medium | **P2** | Inconsistent JWT error codes (VALIDATION_FAILED vs EXPIRED). |
| Localization | Low | Low | Low | **P3** | Hardcoded Indonesian strings in `service.ts`. |
| Edge Case Guarding| Low | Medium | High | **P2** | `matchPathToResource('')` defaults to DASHBOARD. |

---

## 2. Refactoring Order Rationale

> **LOW risk → MEDIUM risk → HIGH risk**

1. **Step 1: Localization & Strings (Low Risk)** - Centralize hardcoded strings to constants.
2. **Step 2: Error Handling (Medium Risk)** - Standardize JWT and Action Factory error codes/messages.
3. **Step 3: RBAC Refinement (Medium Risk)** - Tighten path matching edge cases in the RBAC engine.

---

## 3. Testing Strategy

### What to test first

| Priority | What | Why | Type |
| :---: | --- | --- | --- |
| 1 | `verifyToken` | Ensures security middleware correctly handles expiration vs corruption. | Unit |
| 2 | `matchPathToResource` | Ensures routing fallback doesn't grant unintended access to root. | Unit |

---

## 4. Phased Execution

### Phase 1: Foundation & Localization (F12, F5)

- [ ] **src/features/auth/constants.ts**: Expand `ERROR_MESSAGES` to include all hardcoded strings from `service.ts`.
- [ ] **src/features/auth/service.ts**: Replace all hardcoded Indonesian strings with references to `ERROR_MESSAGES`.

### Phase 2: Error Standardization (F3, F4)

- [x] **src/lib/jwt.ts**: Refine `verifyToken` to ensure `jose` expiration errors are consistently mapped to `EXPIRED` code.
- [x] **src/lib/jwt.ts**: Remove global mutable `cachedSecret` in favor of fail-fast top-level initialization.
- [x] **src/lib/action-factory.ts**: Update `handleActionFailure` to map internal "Unauthorized" to localized `ERROR_MESSAGES.SESSION_EXPIRED`.

### Phase 3: RBAC & Perimeter Refinement (F1, F2)

- [x] **src/lib/rbac.ts**: Update `matchPathToResource` to distinguish between root path `/` (DASHBOARD) and empty string `''` (UNKNOWN).
- [x] **src/lib/rbac.ts**: Replace procedural `permissionSet` function with a declarative `PERMISSION_LEVEL_MAP` for capability resolution.
- [x] **src/lib/rbac.ts**: Refactor `matchPathToResource` from procedural loop to declarative `.find()` method.
- [x] **src/middleware.ts**: Verify redirect logic when `matchPathToResource` returns `UNKNOWN` for authenticated users.
- [x] **src/middleware.ts**: Decompose procedural `middleware` function into focused `handleAuthGuard` and `handleRbacGuard` handlers.
- [x] **src/middleware.ts**: Standardize URL construction via `redirectTo` helper to remove infrastructure duplication.

---

## 5. Verification Plan

- [ ] All 121 characterization/unit tests pass.
- [ ] `src/features/auth/__tests__/m02-top5-characterization.test.ts` updated to reflect "corrected" behavior (no more "surprising" fallbacks).
- [ ] Coverage for `jwt.ts` and `rbac.ts` remains at 95%+.
