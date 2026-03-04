# M-02: Auth & Middleware — Refactoring Findings

> Date: 2026-03-04 (Post-Refactor Update)

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

### 3.1 Hardcoded Post-Auth Landing Page
**Behavior:** Authenticated users trying to access `/login` are hard-redirected to `/users`.
**Status:** **OPEN**. Needs `getLandingPage(role)` refactor in `rbac.ts`.

### 3.2 "Open-by-Default" for Unknown Paths
**Behavior:** Unknown paths currently bypass RBAC guards if not registered.
**Status:** **OPEN**. Needs "Closed-by-Default" refactor in `middleware.ts`.

### 3.3 Coarse-Grained Master Data Permission
**Behavior:** Multiple domains share the same `MASTER_DATA` permission.
**Status:** **OPEN**. Needs granular resource split in `rbac.ts`.

---

## 5. Test Coverage Summary

| File             | Stmt Coverage | Branch Coverage | Status    |
| ---------------- | ------------: | --------------: | --------- |
| jwt.ts           |        100.0% |          100.0% | **DONE**  |
| crypto.ts        |        100.0% |          100.0% | **DONE**  |
| service.ts       |        100.0% |          100.0% | **DONE**  |
| auth-helpers.ts  |        100.0% |          100.0% | **DONE**  |
| rbac.ts          |         76.9% |           82.7% | **READY** |

**Total:** 80+ tests passing. 

---

## 6. Critical User Journeys (CUJs)

| ID     | Journey Name | Scenario | Expected Outcome |
| :----- | :----------- | :------- | :--------------- |
| CUJ-01 | Secure Login | Valid tech login | Redirect to landing page, cookie set, audit log generated. |
| CUJ-02 | Guest Guard  | Access protected route while logged out | Redirect to `/login` with `from` param. |
| CUJ-03 | RBAC Guard   | Inactive user session refresh | `validateSessionUser` returns null, session terminates. |
