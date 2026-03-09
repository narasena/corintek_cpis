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

### 2.5 Fail-Fast JWT Initialization
**Location:** `src/lib/jwt.ts`
**Pattern:** Replaced lazy-initialization of `SECRET_KEY` with a top-level IIFE constant.
**Benefit:** Ensures `JWT_SECRET` is present and valid at module load time; removes global mutable `cachedSecret`.

### 2.6 Identity Resolution Helper
**Location:** `src/middleware.ts`
**Pattern:** Extracted `getIdentity` helper to encapsulate token retrieval, verification, and schema parsing.
**Benefit:** Improved testability and reusability of identity resolution logic.

### 2.7 Guard Handler Decomposition
**Location:** `src/middleware.ts`
**Pattern:** Decomposed procedural `middleware` into `handleAuthGuard` and `handleRbacGuard`.
**Benefit:** Isolates authentication redirects from authorization checks; improves auditability of the security perimeter.

### 2.8 Middleware Redirect Helper
**Location:** `src/middleware.ts`
**Pattern:** Introduced `redirectTo(request, path, params)` to encapsulate Next.js URL/redirect construction.
**Benefit:** Standardizes redirect behavior and removes repetitive infrastructure code from security guards.

### 2.9 Declarative RBAC Capability Mapping
**Location:** `src/lib/rbac.ts`
**Pattern:** Replaced procedural `permissionSet` function with `PERMISSION_LEVEL_MAP` object.
**Benefit:** Decouples permission definitions from logic; improves extensibility for new permission levels.

### 2.10 Declarative Path Matching
**Location:** `src/lib/rbac.ts`
**Pattern:** Replaced procedural `for...of` loop in `matchPathToResource` with `.find()` call.
**Benefit:** Simplifies path-to-resource resolution and removes unused procedural branches.

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

These journeys represent the most critical paths for Auth & Middleware.

| ID     | Journey Name                     | Scenario                                                                 | Expected Outcome                                                                 |
| :----- | :------------------------------- | :----------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| CUJ-01 | **Secure Authentication Flow**    | User logs in with valid credentials, then logs out.                      | Token is set in cookies, redirect to role-specific landing, logout clears cookie. |
| CUJ-02 | **Middleware Perimeter Guard**   | Guest tries to access `/users`; Auth user tries to access `/chemicals`.  | Guest redirected to `/login?from=...`, Auth user redirected to `/forbidden`.     |
| CUJ-03 | **Server Action RBAC Enforcement** | TECHNICIAN role attempts a "Delete User" server action via `actionFactory`. | Action returns `UNAUTHORIZED` status; handler is never executed.                  |

---

## 7. Surprising Behaviors Discovered During Characterization (2026-03-07)

### 7.1 matchPathToResource Fallback Divergence (RESOLVED)
**Location:** `src/lib/rbac.ts`
**Resolution:** Updated `PATH_RESOURCE_MAP` to use explicit regex `^\/?$` for DASHBOARD.
**Benefit:** Ensures root and empty paths are explicitly mapped to Dashboard, while other unknown paths correctly fall back to `UNKNOWN`.
**Risk if changed:** Medium.

### 7.2 verifyToken Generic Error Code (RESOLVED)
**Location:** `src/lib/jwt.ts`
**Resolution:** Extracted error handling to `handleJwtError`. Ensured `jose.errors.JWTExpired` is always mapped to `EXPIRED` code, and Zod validation errors return `VALIDATION_FAILED`.
**Benefit:** Catch blocks relying on specific codes for refresh logic are now reliable.
**Risk if changed:** Medium.

### 7.3 actionFactory Raw Error Leak (RESOLVED)
**Location:** `src/lib/action-factory.ts`
**Behavior:** When `requireActor` fails, the factory now returns localized `ERROR_MESSAGES.SESSION_EXPIRED` instead of the internal "Unauthorized" string.
**Resolution:** Implemented **Replace Conditional with Strategy** pattern in `handleActionFailure` to map internal `AuthenticationError` and `ZodError` to centralized error constants.
**Risk if changed:** Low.

### 7.4 Hardcoded Indonesian Localization (RESOLVED)
**Location:** `src/features/auth/service.ts`, `src/lib/action-factory.ts`
**Behavior:** Authentication failure messages and action factory errors were previously hardcoded.
**Resolution:** All UI and error strings are now centralized in `src/features/auth/constants.ts` under `ERROR_MESSAGES` and `SUCCESS_MESSAGES`.
**Benefit:** Enables easy i18n/localization and ensures consistent error feedback across the system.
**Risk if changed:** Low.

### 7.5 User Identity Data Leakage (RESOLVED)
**Location:** `src/features/users/utils.ts`, `src/@types/user.type.ts`
**Behavior:** Previously, `deletedAt` metadata was included in the public-facing `TUserResponse`, exposing soft-delete internals to the UI.
**Resolution:** Split user schemas into `userInternalSchema` (inclusive) and `userResponseSchema` (public). Updated `toUserResponse` mapper to strip `deletedAt` before returning data.
**Benefit:** Improved data privacy and adherence to Least Privilege principles for API responses.

### 7.6 Loose Typing in User Mappers (RESOLVED)
**Location:** `src/features/users/utils.ts`
**Behavior:** `toUserResponse` accepted `unknown` input, relying solely on runtime Zod parsing.
**Resolution:** Specialised the input type to `TUserInternal`, ensuring compile-time verification that the database object contains the necessary fields for mapping.
**Benefit:** Better IDE support and early detection of schema mismatches.

### 7.7 Data Duplication in Client Policies (RESOLVED)
**Location:** `src/lib/rbac/policies/client.policy.ts`
**Behavior:** `CLIENT` and `CLIENT_SUPERVISOR` roles previously shared fully duplicated permission sets and landing pages.
**Resolution:** Extracted common permissions into `BASE_CLIENT_POLICY` and used spread operator for role-specific overrides.
**Benefit:** Improved maintainability; changes to base client permissions now only need to be made in one place.

### 7.8 Redundant Data Mapping in User Context (RESOLVED)
**Location:** `src/features/auth/lib/user-context.ts`
**Behavior:** `getCurrentUserDetails` previously manually picked and re-mapped individual user fields.
**Resolution:** Re-defined `ICurrentUserDetails` as a type alias for `TUserResponse` and delegated the mapping entirely to `authService.validateSessionUser`.
**Benefit:** Reduced boilerplate and maintenance risk; the user context now automatically stays in sync with the global user response schema.

### 7.9 Implicit Work Factor in Crypto (RESOLVED)
**Location:** `src/features/auth/crypto.ts`
**Behavior:** `hashPassword` previously used a fixed work factor from constants, preventing override for higher-security accounts or faster testing.
**Resolution:** Parameterized `hashPassword` to accept an optional `rounds` argument, defaulting to the system constant.
**Benefit:** Increased flexibility for future security tiering and improved test performance.

### 7.10 Procedural Error Handling in Public Actions (RESOLVED)
**Location:** `src/features/auth/actions.ts`
**Behavior:** `loginAction` previously manually extracted error messages, leading to inconsistent formatting for Zod validation errors compared to protected actions.
**Resolution:** Standardized the `catch` block to use the same extraction logic as `actionFactory` (picking the first Zod error message) and unified the logging format.
**Benefit:** Consistent user feedback regardless of whether the action is public or protected, and better observability via standardized logs.

### 7.11 Leaky Cookie Security Policy (RESOLVED)
**Location:** `src/lib/auth-helpers.ts`
**Behavior:** Cookie security options (httpOnly, secure, etc.) were previously hardcoded directly in `setAuthSession`, coupling the session mechanism with security policy.
**Resolution:** Extracted cookie options into a dedicated `getAuthCookieOptions` helper function.
**Benefit:** Centralized control over cookie security policy and cleaner separation of concerns within the infrastructure layer.

### 7.12 Procedural/String-Based Logging (RESOLVED)
**Location:** `src/features/auth/service.ts`, `src/lib/logger.ts`
**Behavior:** Log messages were previously manually concatenated with template literals, making them difficult to aggregate and monitor at scale.
**Resolution:** Introduced a project-wide `CPIS Structured Logger` in `src/lib/logger.ts` and migrated the auth service to use it.
**Benefit:** Centralized formatting, machine-readable context, and automated prefixing (`[CPIS-AUTH]`, `[CPIS-ERROR]`) ensuring adherence to project conventions.

---

## 8. Final Test Coverage Summary (Re-Baseline)

**Created test files:**
1. `src/features/auth/__tests__/m02-top5-characterization.test.ts` (8 tests)
2. `src/features/auth/auth-integration.test.ts` (8 tests)
3. `src/features/auth/auth-utils.test.ts` (7 tests)
4. `src/middleware.test.ts` (7 tests)
5. `src/lib/rbac.test.ts` (25 tests)
6. `src/lib/rbac-path.test.ts` (10 tests)
7. `src/lib/jwt.test.ts` (5 tests)
8. `src/lib/auth-helpers.test.ts` (19 tests)
9. `src/lib/action-factory.test.ts` (5 tests)
10. `src/lib/m03-final-characterization.test.ts` (14 tests)
11. `src/__tests__/m01-functions-characterization.test.ts` (5 tests)

**Total:** 113 characterization and unit tests passing for M-02.

---

## 9. Coverage Gate

| Risk Level      | Target | Current |  Status   |
| --------------- | -----: | ------: | :-------: |
| Critical paths  |   75%+ |   97.7% |     ✅     |
| HIGH risk areas |   60%+ |   95.0% |     ✅     |

**⚠️ Coverage thresholds met. Proceeding to Phase 3.**
