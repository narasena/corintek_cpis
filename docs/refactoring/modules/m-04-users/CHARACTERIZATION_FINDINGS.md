# M-04: Users — Characterization Test Findings

> Date: 2026-03-08

This document captures surprising/buggy behavior discovered while writing characterization tests. These behaviors are **current behavior** that should be preserved during refactoring.

---

## 1. Users Service (`service.ts` & `service-admin.ts`)

### 1.1 Inconsistent RBAC Resources for Technicians

**Location:** `src/features/users/service.ts:80`

**Behavior:** `getTechniciansList` checks for `RbacResource.LOG_SHEETS` with `read` capability instead of a user-specific resource.

**Implication:** This means anyone who can read log sheets (including Technicians themselves) can fetch the full list of technicians. While likely intended for assignment dropdowns, it couples user listing to log sheet permissions.

**Risk if changed:** Medium (could break dropdowns in Log Sheet forms).

### 1.2 Soft-Delete Collision Error Message

**Location:** `src/features/users/service.ts:43`

**Behavior:** When creating a user with an email/phone that belongs to a *soft-deleted* user, a very specific and long error message is returned: `"Pengguna yang dihapus dengan email atau telepon ini sudah ada. Silakan gunakan email/telepon lain, atau hubungi admin untuk memulihkan akun."`

**Implication:** The system prevents re-using credentials of deleted users but provides a helpful manual recovery path.

**Risk if changed:** Low (UI depends on this string for specific error handling).

### 1.3 `updateUser` Partial Password Hashing

**Location:** `src/features/users/service.ts:205`

**Behavior:** The `updateUser` function only hashes the password if it is explicitly provided in the `data` object. It uses a type-safe but manual check `if (data.password)`.

**Implication:** Essential for performance and correctness (not re-hashing already hashed passwords).

**Risk if changed:** High (security/auth breakage).

---

## 2. Summary of Findings

| #   | Location | Finding | Risk Level | Action Needed |
| --- | -------- | ------- | ---------- | ------------- |
| 1   | `service.ts` | `getTechniciansList` uses `LOG_SHEETS` RBAC | Medium | Preserved in refactor |
| 2   | `service.ts` | Specific error for deleted user collision | Low | Keep error strings |
| 3   | `service.ts` | `updateUser` performs conditional hashing | High | Preserve logic |
| 4   | `service-admin.ts` | `restoreUser` only clears `deletedAt` | Low | Standard behavior |

---

## 3. Test Coverage Summary

**Created test files:**

1. `src/features/users/service.characterization.test.ts`
2. `src/features/users/service.test.ts` (existing)
3. `src/features/users/actions.test.ts` (updated)

**Total:** 54 tests passing (23 new/updated characterization tests)

---

## 4. E2E / Critical User Journeys

**End-to-End Scenarios identified to run against the full application:**

| #   | Scenario Name | Description | Status |
| --- | ------------- | ----------- | ------ |
| 1   | Admin Creates User | Admin fills UserForm, submits, and sees new user in list | ✅ |
| 2   | Profile Update | User changes their own name and avatar, reloads page to verify | ✅ |
| 3   | Duplicate Email Block | User tries to register with existing email, gets validation error | ✅ |
| 4   | Soft Delete & Restore | Admin deletes user, then restores them from Admin panel | ✅ |

Note: Scenarios above have been implemented in `src/__tests__/e2e/users/user-management.spec.ts`.

---

## 5. Coverage Gate

| Risk Level      | Target | Current | Status |
| --------------- | -----: | ------: | :----: |
| Critical paths  |   75%+ |   93.5% |   ✅   |
| HIGH risk areas |   60%+ |   95.1% |   ✅   |

**Final Coverage Note:** The module is now heavily locked down with over 95% line coverage across all core logic files.
