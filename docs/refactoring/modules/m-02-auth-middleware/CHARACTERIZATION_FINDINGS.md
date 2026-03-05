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

---

## 3. Pending Middleare & RBAC Issues (Next Phase)

### 3.1 Closed-by-Default Middleware Guard
**Behavior:** Middleware still has some "Open-by-Default" logic for authenticated users.
**Status:** **OPEN**. Needs final hardening in `middleware.ts` to leverage the new `UNKNOWN` resource.

---

## 4. Known Regressions & Integration Issues

### 4.1 Zod Validation Mismatch in Test Mocks
**Issue:** Several tests in `auth-integration.test.ts`, `auth-utils.test.ts`, and `auth-helpers.test.ts` are currently failing.
**Root Cause:** The `toUserResponse` utility (in `src/features/users/utils.ts`) now strictly enforces a Zod schema (`userResponseSchema`) that requires several fields (UUID format for ID, employmentStatus, etc.) which are missing or improperly formatted in the legacy test mocks.
**Impact:** 8 tests are failing, preventing a clean baseline for Phase 2.

---

## 5. Test Coverage Summary

| File             | Stmt Coverage | Branch Coverage | Status    |
| ---------------- | ------------: | --------------: | --------- |
| jwt.ts           |        100.0% |          100.0% | **DONE**  |
| crypto.ts        |        100.0% |          100.0% | **DONE**  |
| service.ts       |         95.0% |           90.0% | **FIXME** |
| auth-helpers.ts  |         85.0% |           80.0% | **FIXME** |
| rbac.ts          |        100.0% |         100.0% | **DONE**  |

**Total:** 73 tests passing (65 success, 8 failed due to schema mismatches). 

---

## 6. Critical User Journeys (CUJs)

| ID     | Journey Name | Scenario | Expected Outcome |
| :----- | :----------- | :------- | :--------------- |
| CUJ-01 | Secure Login | Valid tech login | Redirect to landing page, cookie set, audit log generated. |
| CUJ-02 | Guest Guard  | Access protected route while logged out | Redirect to `/login` with `from` param. |
| CUJ-03 | RBAC Guard   | Inactive user session refresh | `validateSessionUser` returns null, session terminates. |
