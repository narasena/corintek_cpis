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
**Behavior:** Previously used a private `Map` without size limits, relying on external calls to `clearCache()`.
**Refactoring Result:** Implemented **Capped Cache & Flattened Logic**. Added a `CACHE_LIMIT` (1000) and automatic flush when full.
**Impact:** Memory growth is now strictly bounded regardless of session length. Cyclomatic complexity reduced by extracting row-ranking logic and using array primitives (`some`, `map`).
**Risk after change:** Medium.

---

## 4. Camera & Media (src/components/camera-input.tsx)

### 4.1 Object URL Leakage
**Location:** `capturePhoto` and `handleFileChange`
**Behavior:** Previously created preview URLs but never revoked them.
**Refactoring Result:** Implemented **Resource Lifecycle Hook**. Added a `previewUrlRef` and a `revokeCurrentPreview` helper.
**Impact:** All Blob URLs are now revoked when replaced, when the user deletes the image, or when the component unmounts. Memory leak resolved.
**Risk after change:** Low.

---

## 5. Error Handling (src/lib/error-handler-service.ts)

### 5.1 Static Indonesian Mapping
**Location:** `getUserMessage`
**Behavior:** Previously hardcoded dictionary inside the method.
**Refactoring Result:** Extracted to **ERROR_TRANSLATIONS constant**. Added a `DEFAULT` fallback and parameterized `formatErrorMessage` to support dynamic logging contexts.
**Impact:** Improved maintainability and standardized log prefixes (`[CPIS-ERROR] Feature.Method`).
**Risk after change:** Low.

---

## 6. Sidebar (src/components/app-sidebar.tsx)

### 6.1 Manual Logic Repetition
**Location:** `AppSidebar` Component
**Behavior:** Previously hardcoded four distinct filtering and rendering calls for navigation categories.
**Refactoring Result:** Successfully migrated to **Data-Driven Mapping**. The component now iterates over a configuration array, reducing LOC by 26% and improving maintainability.
**Risk after change:** Low.

---

## 7. JWT Infrastructure (src/lib/jwt.ts)

### 7.1 Exception-based Flow Control
**Location:** `verifyToken` function
**Behavior:** Previously threw `JWTError` on any failure, requiring `try/catch` at every call site.
**Refactoring Result:** Migrated to **TActionResult pattern**. The function now returns a standardized `{ success: true, data }` or `{ success: false, error }` object.
**Impact:** 8+ test files and core middleware updated to handle the new return type. Call sites are now cleaner and follow the project's standard result pattern.
**Risk after change:** Low.

---

## 8. DI Infrastructure (src/lib/di/factories.ts)

### 8.1 Structural Layer Inversion
**Location:** `factories.ts`
**Behavior:** Foundational layer (`src/lib`) was importing concrete service implementations from the feature layer (`src/features`).
**Refactoring Result:** Implemented **Dependency Inversion**. Concrete factories were moved to their respective feature directories (`src/features/*/di.ts`).
**Impact:** Circular dependency risks eliminated. The foundation layer is now purely abstract, and the feature layer correctly depends on it.
**Risk after change:** High (Structural change).

---

## 9. Summary of Findings

| #   | Category    | Finding                                | Risk | Action |
| --- | ----------- | -------------------------------------- | ---- | ------ |
| 1   | RBAC        | `ADMIN` restricted on `PROJECTS_LIST`  | Med  | Preserve |
| 2   | RBAC        | `PUBLIC` bypasses security             | High | Preserve |
| 3   | UI          | Double rendering (Mobile/Desktop)      | Low  | Preserve (Fix in Ph5?) |
| 4   | Search      | Cache never cleared in hook            | Med  | ✅ Refactored |
| 5   | Camera      | Missing `revokeObjectURL`              | Low  | ✅ Refactored |
| 6   | Sidebar     | Manual category repetition             | Low  | ✅ Refactored |
| 7   | JWT         | Exception-based flow control           | Low  | ✅ Refactored |
| 8   | Error       | Hardcoded localized messages           | Low  | ✅ Refactored |
| 9   | DI          | Structural layer inversion             | High | ✅ Refactored |
| 10  | Factory     | Brittle error mapping                  | Med  | ✅ Refactored |

**⚠️ Characterization Complete. Proceed to Phase 3: Map.**
