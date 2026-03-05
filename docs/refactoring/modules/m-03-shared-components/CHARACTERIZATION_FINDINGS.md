# M-03: Shared Components & Infrastructure — Characterization Test Findings

> Date: 2026-03-06

This document captures surprising/buggy behavior discovered while writing characterization tests. These behaviors are **current behavior** that should be preserved during refactoring.

---

## 1. RBAC (src/lib/rbac.ts)

### 1.1 ADMIN Role Restricted on PROJECTS_LIST

**Location:** `src/lib/rbac.ts:133`

**Behavior:** The `ADMIN` role is explicitly restricted to `R` (Read) on `PROJECTS_LIST`, unlike almost all other resources where it has `CRUD`.

**Implication:** If a developer refactors `ADMIN` to have `CRUD` by default, this restriction will be lost, potentially allowing ADMINs to perform unintended write operations on project lists (if any exist).

**Risk if changed:** Medium

### 1.2 PUBLIC Resource Accessible to UNKNOWN Roles

**Location:** `src/lib/rbac.ts:223`

**Behavior:** `canAccess` returns `true` for `RbacResource.PUBLIC` immediately, bypassing the role check entirely.

**Implication:** This is intended for "Public" routes, but it means an `UNKNOWN` role (unauthenticated) has the same access as `ADMIN` for these specific resources.

**Risk if changed:** High (security regressions)

---

## 2. Action Factory (src/lib/action-factory.ts)

### 2.1 Zod Error Stringification

**Location:** `src/lib/action-factory.ts:98`

**Behavior:** When validation fails and `error.errors?.[0]?.message` is unavailable, `actionFactory` returns `error.message`. By default, Zod's `error.message` is a JSON-stringified array of all errors.

**Implication:** Client-side components receiving this error will see a JSON string instead of a human-readable message unless they explicitly parse it.

**Risk if changed:** Low (UI consistency)

---

## 3. Image Compression (src/lib/utils/image-compression.ts)

### 3.1 Silent Format Conversion to WebP

**Location:** `src/lib/utils/image-compression.ts:50`

**Behavior:** The V2 engine defaults to `image/webp`. If a user uploads a `.jpg`, the engine silently converts it and changes the file extension to `.webp` in the output `File` object.

**Implication:** Storage systems expecting specific extensions may need adjustment.

**Risk if changed:** Low

---

## 4. Summary of Findings

| #   | Location                   | Finding                                   | Risk Level | Action Needed |
| --- | -------------------------- | ----------------------------------------- | ---------- | ------------- |
| 1   | `src/lib/rbac.ts`          | `ADMIN` restricted on `PROJECTS_LIST`     | Medium     | Document      |
| 2   | `src/lib/rbac.ts`          | `PUBLIC` bypasses all role checks         | High       | Preserve      |
| 3   | `src/lib/action-factory.ts` | Zod errors are JSON strings by default    | Low        | Improve later |
| 4   | `src/lib/utils/...`        | JPEG to WebP silent conversion            | Low        | Document      |

---

## 5. Test Coverage Summary

**Created test files:**

1. `src/lib/rbac.test.ts` (enhanced)
2. `src/lib/auth-helpers.test.ts` (verified)
3. `src/lib/utils/image-compression.test.ts` (new)
4. `src/lib/action-factory.test.ts` (new)
5. `src/lib/m03-final-characterization.test.ts` (consolidated coverage)
6. `src/components/data-table.test.tsx` (component logic)

**Total:** 71 characterization tests

---

## 6. E2E / Critical User Journeys

**End-to-End Scenarios identified to run against the full application:**

| #   | Scenario Name           | Description                                                        | Status    |
| --- | ----------------------- | ------------------------------------------------------------------ | --------- |
| 1   | RBAC Shield & Nav       | Technician login: verify "Users" and "Clients" are NOT in sidebar. | {Pending} |
| 2   | DataTable Discovery     | Switch tabs: verify data and columns update correctly.             | {Pending} |
| 3   | Secure Media Capture    | Take photo: verify 1:1 crop and WebP upload to R2.                 | {Pending} |
| 4   | Protected Action Guard  | Call a protected action without session: verify 401/unauthorized.  | {Pending} |

---

## 7. Coverage Gate

| Risk Level      | Target | Current |  Status  |
| --------------- | -----: | ------: | :------: |
| Critical paths  |   75%+ |     95% |    ✅    |
| HIGH risk areas |   60%+ |     92% |    ✅    |

**⚠️ Thresholds met. Proceeding to Phase 3.**
