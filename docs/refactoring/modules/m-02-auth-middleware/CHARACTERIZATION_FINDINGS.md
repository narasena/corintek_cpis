# M-02: Auth & Middleware — Characterization Test Findings

> Date: 2026-03-04

This document captures behaviors discovered while analyzing the Authentication and Middleware logic. These behaviors are **current behavior** that should be preserved or carefully transitioned during refactoring.

---

## 1. Middleware Logic

### 1.1 Hardcoded Post-Auth Redirect

**Location:** `src/middleware.ts:38`

**Behavior:** When an authenticated user attempts to access `/login`, they are always redirected to `/users`.

**Implication:** If the landing page or dashboard changes, this hardcoded path will break the expected user flow. It assumes `/users` is the default landing page for ALL roles.

**Risk if changed:** Medium

### 1.2 Static Asset and API Bypass

**Location:** `src/middleware.ts:47`

**Behavior:** The middleware explicitly bypasses authentication checks for paths starting with `/_next`, `/api`, or containing a dot (`.`).

**Implication:** Any API route under `/api` is implicitly public at the middleware level and must handle its own authentication/authorization.

**Risk if changed:** High (Security)

---

## 2. Authentication Service

### 2.1 Sequential Error Messages

**Location:** `src/features/auth/service.ts:25-45`

**Behavior:** The `authenticateUser` function checks for user existence, block status, and active status *before* verifying the password, and returns specific error messages for each (except for user existence and password mismatch which share the same message for security).

**Implication:** Provides internal clarity but reveals account state (blocked/inactive) to an attacker if the email is known.

**Risk if changed:** Low (User Experience)

---

## 3. Summary of Findings

| #   | Location | Finding | Risk Level | Action Needed |
| --- | -------- | ------- | ---------- | ------------- |
| 1   | middleware.ts | Hardcoded `/users` redirect | Medium | Parameterize landing page |
| 2   | middleware.ts | Implicitly public `/api` routes | High | Verify API-level auth |
| 3   | service.ts | Account status leakage | Low | Consider generic error |
| 4   | rbac.ts | Path matching is prefix-based | Medium | Verify deep nested routes |

---

## 4. Test Coverage Summary

**Existing test files:**

1. `src/lib/rbac.test.ts`
2. `src/lib/auth-helpers.test.ts`

**Proposed Characterization Tests:**

1. `src/middleware.test.ts` (Mocking NextRequest/NextResponse to verify redirection matrix)
2. `src/features/auth/auth-integration.test.ts` (Integration test with Prisma mock for login flow)

**Total:** 2 existing, 2 proposed

---

## 5. E2E / Critical User Journeys

**End-to-End Scenarios identified to run against the full application:**

| #   | Scenario Name | Description | Status |
| --- | ------------- | ----------- | ------ |
| 1   | Successful Login | User enters valid credentials, redirected to `/users`, cookie set | {Pending} |
| 2   | Invalid Login | User enters wrong password, stays on login with error | {Pending} |
| 3   | Session Persistence | Authenticated user closes browser, returns, still logged in | {Pending} |
| 4   | RBAC Access Denied | Technician tries to access `/users` (admin only), sees `/forbidden` | {Pending} |
| 5   | Logout Flow | User clicks logout, cookie cleared, redirected to `/login` | {Pending} |
| 6   | Unauthorized Redirect | Guest tries to access `/summary-reports`, redirected to `/login?from=/summary-reports` | {Pending} |
