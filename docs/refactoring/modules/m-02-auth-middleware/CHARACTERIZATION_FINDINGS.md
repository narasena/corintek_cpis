# M-02: Auth & Middleware — Refactoring Findings

> Date: 2026-03-05 (Post-Refactor Update)

This document captures behaviors and improvements in the Auth & Middleware module after the first major refactoring phase.

---

## 1. Resolved Security Smells

### 1.1 Account Status Disclosure (FIXED)
**Location:** `src/features/auth/service.ts`
**Resolution:** Replaced explicit error messages for blocked/inactive accounts with a generic `AUTHENTICATION_FAILED` error. 
**Benefit:** Prevents account enumeration and protects user privacy.

### 1.2 Timing Attack Vulnerability (FIXED)
**Location:** `src/features/auth/service.ts` & `crypto.ts`
**Resolution:** Implemented `secureCompare` using `FAKE_PASSWORD_HASH` for non-existent users.
**Benefit:** Normalizes response time (~100ms) regardless of whether the email exists in the database.

### 1.3 Fragile Path-to-Resource Mapping (FIXED)
**Location:** `src/lib/rbac.ts`
**Resolution:** Replaced the hardcoded `if-else` chain in `matchPathToResource` with a declarative `PATH_RESOURCE_MAP` using regular expressions.
**Benefit:** Decouples path matching from procedural logic, improves readability, and simplifies adding new route patterns.

### 1.4 Coarse-Grained Master Data Permission (FIXED)
**Location:** `src/lib/rbac.ts`
**Resolution:** Decomposed the monolithic `MASTER_DATA` resource into independent `CLIENTS`, `CHEMICALS`, `PARAMETERS`, and `MACHINES` resources.
**Benefit:** Enables domain-specific access control (Least Privilege) and prepares the system for more granular role definitions (e.g., Lab vs. Admin).

### 1.5 Role Metadata Fragmentation (FIXED)
**Location:** `src/lib/rbac.ts`
**Resolution:** Unified `RbacRole` labels and permissions into a single `ROLE_CONFIG` registry.
**Benefit:** Eliminates "Shotgun Surgery" when adding or modifying roles; provides a single source of truth for all role metadata.

### 1.6 Scatter-and-Hardcode Redirection (FIXED)
**Location:** `src/lib/rbac.ts`
**Resolution:** Integrated `landingPage` property into the `ROLE_CONFIG` registry and exposed a `getLandingPage(role)` helper.
**Benefit:** Centralizes post-auth redirection logic; ensures each role lands on a relevant and authorized module.

### 1.7 Open-by-Default Navigation Filtering (FIXED)
**Location:** `src/lib/rbac.ts`
**Resolution:** Inverted the security posture to "Closed-by-Default". Unknown paths now resolve to an `UNKNOWN` resource which is denied by default. Explicitly added a `PUBLIC` resource type for unrestricted paths.
**Benefit:** Prevents accidental data exposure when new routes are added; ensures only explicitly authorized paths are visible or accessible.

### 1.8 Redundant & Fragile Path Guarding (FIXED)
**Location:** `src/middleware.ts`
**Resolution:** Consolidated system path bypass logic into the Next.js `matcher` and removed manual `pathname.startsWith` checks within the middleware function.
**Benefit:** Single source of truth for route exclusion; cleaner, more focused middleware logic.

### 1.9 Role-Agnostic Authenticated Fallthrough (FIXED)
**Location:** `src/middleware.ts`
**Resolution:** Enforced a mandatory role check for all authenticated users. Any valid session missing an authorized role is now explicitly redirected to `/forbidden`.
**Benefit:** Eliminates security gaps for authenticated users with malformed or partial identities.

---

## 2. Infrastructure Improvements

### 2.1 Standardized User Transformation
**Location:** `src/features/users/utils.ts`
**Pattern:** Introduced `userResponseSelect` and `toUserResponse`.
**Benefit:** Strips sensitive fields (password) by default using Zod schema parsing; ensures all required relations (client) are present.

### 2.2 Unified Lifecycle Guard
**Location:** `src/features/users/utils.ts`
**Pattern:** `isUserAuthValid(user)` centralized check for `deletedAt`, `isActive`, and `isBlocked`.
**Benefit:** Consistent security enforcement across login, session refresh, and RBAC helpers.

### 2.3 Success & Failure Auditing
**Location:** `src/features/auth/service.ts`
**Pattern:** Standardized `[CPIS-ERROR]` for debugging failures and `[CPIS-AUTH]` for successful audit logs.
**Benefit:** Improved production observability and security compliance.

### 2.4 Identity Resolution Helper
**Location:** `src/middleware.ts`
**Pattern:** Extracted `getIdentity` helper to encapsulate token retrieval, verification, and schema parsing.
**Benefit:** Improved testability and reusability of identity resolution logic.

---

## 3. Pending Middleare & RBAC Issues (Next Phase)

### 3.1 Closed-by-Default Middleware Guard
**Resolution:** Successfully implemented. Middleware now defaults to `/login` for guests and `/forbidden` for unauthorized users.

---

## 4. Known Regressions & Integration Issues

### 4.1 Zod Validation Mismatch in Test Mocks
**Status:** **RESOLVED**. All relevant test suites for M-02 (81 tests) are now passing after refactoring the middleware and associated helpers.

---

## 5. Test Coverage Summary

| File             | Stmt Coverage | Branch Coverage | Status    |
| ---------------- | ------------: | --------------: | --------- |
| jwt.ts           |        100.0% |          100.0% | **DONE**  |
| crypto.ts        |        100.0% |          100.0% | **DONE**  |
| service.ts       |        100.0% |          100.0% | **DONE**  |
| auth-helpers.ts  |        100.0% |          100.0% | **DONE**  |
| rbac.ts          |        100.0% |          100.0% | **DONE**  |
| middleware.ts    |        100.0% |          100.0% | **DONE**  |

**Total:** 81 tests passing.

---

## 6. Critical User Journeys (CUJs)

| ID     | Journey Name | Scenario | Expected Outcome |
| :----- | :----------- | :------- | :--------------- |
| CUJ-01 | Secure Login | Valid tech login | Redirect to landing page, cookie set, audit log generated. |
| CUJ-02 | Guest Guard  | Access protected route while logged out | Redirect to `/login` with `from` param. |
| CUJ-03 | RBAC Guard   | Access unauthorized route | Redirect to `/forbidden`. |
| CUJ-04 | Closed-by-Default | Access unknown path | Redirect to `/forbidden` (auth) or `/login` (guest). |
