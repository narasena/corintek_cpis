# M-02: Auth & Middleware — Characterization Test Findings

> Date: 2026-03-04

This document captures surprising behavior discovered during the characterization of the Auth & Middleware module.

---

## 1. Middleware & Routing

### 1.1 Hardcoded Post-Auth Landing Page
**Location:** `src/middleware.ts:38`
**Behavior:** Authenticated users trying to access `/login` are hard-redirected to `/users`.
**Implication:** This ignores role-specific dashboards. A "Client" user is forced to `/users` instead of a client-specific portal.
**Risk if changed:** Medium

### 1.2 "Open-by-Default" for Unknown Paths
**Location:** `src/middleware.ts:60`
**Behavior:** If `matchPathToResource(pathname)` returns `null`, the middleware executes `NextResponse.next()`.
**Implication:** Any new page added to the application that isn't explicitly registered in the RBAC mapping is automatically accessible to *any* authenticated user, regardless of their role.
**Risk if changed:** High (Security)

### 1.3 Total API Security Bypass
**Location:** `src/middleware.ts:47`
**Behavior:** Routes starting with `/api` bypass the middleware entirely.
**Implication:** Middleware provides zero protection for the API layer. Every single API route must implement its own redundant auth/RBAC checks.
**Risk if changed:** High (Security)

---

## 2. RBAC Logic (src/lib/rbac.ts)

### 2.1 Coarse-Grained Master Data Permission
**Location:** `src/lib/rbac.ts:192`
**Behavior:** `/clients`, `/chemicals`, `/parameters`, and `/machines` are all mapped to the single `MASTER_DATA` resource.
**Implication:** It is impossible to give a user access to manage "Chemicals" without also giving them access to "Clients" and "Machines".
**Risk if changed:** Medium

### 2.2 Case-Sensitive Role Matching
**Location:** `src/lib/rbac.ts:167`
**Behavior:** `ROLE_MATRIX[role as TRbacRole]` performs a direct key lookup.
**Implication:** If a database role is returned as "admin" (lowercase), the lookup returns `undefined`, and access is denied, even if the user is valid.
**Risk if changed:** Low

---

## 3. Auth Service (src/features/auth/service.ts)

### 3.1 Account Status Disclosure
**Location:** `src/features/auth/service.ts:25-45`
**Behavior:** Returns explicit errors for "Account Blocked" or "Account Inactive" before verifying the password.
**Implication:** An attacker can perform account enumeration to find valid emails and their administrative status.
**Risk if changed:** Low (Security/Privacy)

---

## 5. Test Coverage Summary

| File             | Stmt Coverage | Branch Coverage | Status    |
| ---------------- | ------------: | --------------: | --------- |
| middleware.ts    |         96.1% |           96.0% | **READY** |
| service.ts       |        100.0% |          100.0% | **READY** |
| auth-helpers.ts  |         90.0% |          100.0% | **READY** |
| rbac.ts          |         76.9% |           82.7% | **READY** |

**Total:** 62 characterization tests passed. 
Threshold (75% for critical paths) has been met for all core auth files.

---

## 6. E2E / Critical User Journeys (CUJs)

These journeys are critical to system integrity and must be verified before and after refactoring.

| ID     | Journey Name | Scenario | Expected Outcome |
| :----- | :----------- | :------- | :--------------- |
| CUJ-01 | Secure Login | Valid tech login | Redirect to `/users`, cookie set, session persists on refresh. |
| CUJ-02 | Guest Guard  | Access `/summary-reports` while logged out | Redirect to `/login?from=/summary-reports`. |
| CUJ-03 | RBAC Guard   | Client access to `/users` (Admin Only) | Redirect to `/forbidden`. |

---

## 7. Next Steps

- [x] Measure test coverage for `middleware.ts` and `service.ts`.
- [ ] Implement E2E tests in Playwright for the above CUJs.
- [ ] Proceed to Phase 3 (Map).
