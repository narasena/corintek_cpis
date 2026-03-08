# M-03: Shared Components & Infrastructure — Characterization Test Findings

> Snapshot: 2026-03-08

This document captures surprising, non-obvious, or potentially problematic behaviors discovered during the Phase 2 Characterization. These behaviors are part of the "Current State" and must be explicitly handled during refactoring.

---

## 1. RBAC (src/lib/rbac.ts)

### 1.1 ADMIN Role Restricted on PROJECTS_LIST
**Location:** `src/lib/rbac.ts`
**Behavior:** The `ADMIN` role is explicitly restricted to `R` (Read) on `PROJECTS_LIST`, while having `CRUD` on almost every other resource.
**Implication:** A global "Admin can do everything" refactor would break this specific constraint.
**Risk if changed:** Medium.

### 1.2 PUBLIC Resource Access
**Location:** `src/lib/rbac.ts`
**Behavior:** `canAccess` returns `true` for `RbacResource.PUBLIC` immediately, bypassing all role/capability checks.
**Implication:** Any "UNKNOWN" or unauthenticated role has full access to these resources.
**Risk if changed:** High (Security regression).

### 1.3 Greedy Path Matching
**Location:** `matchPathToResource`
**Behavior:** Uses `RegExp.test(pathname)`. For example, `/users` matches `RbacResource.USERS_ADMIN`.
**Implication:** Sub-paths like `/users/123/edit` are automatically categorized under `USERS_ADMIN` because the regex `/^\/users/` matches any path *starting* with `/users`.
**Risk if changed:** Medium (Broken navigation/authorization).

---

## 2. DataTable (src/components/data-table.tsx)

### 2.1 Double DOM Rendering
**Location:** `DataTable` Component
**Behavior:** The component renders both the `<div className="hidden md:block">` (Desktop Table) and `<div className="md:hidden">` (Mobile Cards) into the DOM simultaneously.
**Implication:** Characterization tests using `getByText` will fail with "Found multiple elements". Developers must use `getAllByText` and understand that CSS `hidden` does not remove elements from the DOM.
**Risk if changed:** Low (Performance impact if removed, but logic remains same).

---

## 3. Search & Filtering (src/lib/search-filter-service.ts)

### 3.1 Persistent Levenshtein Cache
**Location:** `SearchFilterService.levenshteinCache`
**Behavior:** The service uses a private `Map` to cache distance calculations. While a `clearCache()` method exists, it is **never called** by the `useDataTableSearch` hook.
**Implication:** In a long-running session where a user performs many unique fuzzy searches, the memory usage of this cache will grow monotonically.
**Risk if changed:** Low (Memory leak potential in extreme cases).

---

## 4. Camera & Media (src/components/camera-input.tsx)

### 4.1 Object URL Leakage
**Location:** `capturePhoto` and `handleFileChange`
**Behavior:** Uses `URL.createObjectURL(compressedFile)` to generate a preview URL.
**Implication:** There is no corresponding `URL.revokeObjectURL` call when the component unmounts or when the image is cleared/replaced. 
**Risk if changed:** Medium (Memory leak in browser-based sessions).

---

## 5. Error Handling (src/lib/error-handler-service.ts)

### 5.1 Static Indonesian Mapping
**Location:** `getUserMessage`
**Behavior:** Hardcoded dictionary for `NetworkError`, `TimeoutError`, etc.
**Implication:** If a new error type is introduced without updating this service, the user receives a generic "Maaf, terjadi kesalahan" even if the error name is descriptive.
**Risk if changed:** Low (UX degradation).

---

## 6. Summary of Findings

| #   | Category    | Finding                                | Risk | Action |
| --- | ----------- | -------------------------------------- | ---- | ------ |
| 1   | RBAC        | `ADMIN` restricted on `PROJECTS_LIST`  | Med  | Preserve |
| 2   | RBAC        | `PUBLIC` bypasses security             | High | Preserve |
| 3   | UI          | Double rendering (Mobile/Desktop)      | Low  | Preserve (Fix in Ph5?) |
| 4   | Search      | Cache never cleared in hook            | Low  | Add `useEffect` cleanup |
| 5   | Camera      | Missing `revokeObjectURL`              | Med  | Add cleanup |

**⚠️ Characterization Complete. Proceed to Phase 3: Map.**
