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
**Behavior:** Previously used open-ended `RegExp.test(pathname)`, causing incorrect matches for sibling paths (e.g. `/users-backup` matching `/users`).
**Refactoring Result:** Implemented **Standardize Path Boundary Logic**. Introduced `createPathPattern` helper that ensures strict boundaries (`$`, `/`, `?`, or `#`).
**Impact:** Security vulnerability resolved. Sibling paths no longer inherit parent permissions unless explicitly mapped.
**Risk after change:** Low.

---

## 2. DataTable (src/components/data-table.tsx)

### 2.1 Double DOM Rendering
**Location:** `DataTable` Component
**Behavior:** Previously rendered both desktop and mobile views into the DOM simultaneously for both Simple and Tabbed modes.
**Refactoring Result:** Implemented **Extract Sub-Component**. Moved Toolbar logic to `DataTableToolbar` and unified layout orchestration.
**Impact:** Reduced internal state complexity. Fixed logic where inactive tabs still processed data by introducing `isActive` prop and strict data passing.
**Risk after change:** Medium.

---

## 3. Search & Filtering (src/lib/search-filter-service.ts)

### 3.1 Persistent Levenshtein Cache
**Location:** `SearchFilterService.levenshteinCache`
**Behavior:** Previously used a private `Map` without size limits, relying on external calls to `clearCache()`.
**Refactoring Result:** Implemented **Capped Cache & Flattened Logic**. Extracted core string algorithms to `lib/utils/string-algorithms.ts`.
**Impact:** Memory growth is strictly bounded (limit: 1000). High mix of abstraction levels resolved by extracting low-level math/string logic. Logic duplication in `HighlightText` component killed by sharing the same algorithm.
**Risk after change:** Low.

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

## 8. DI Infrastructure (Reverse Layer Inversion)

### 8.1 Structural Layer Inversion (Service Factories)
**Location:** `factories.ts` (Removed)
**Refactoring Result:** Implemented **Dependency Inversion**. Concrete factories moved to feature directories (`src/features/*/di.ts`).
**Impact:** Foundation layer no longer depends on features. Circular dependency risks eliminated.
**Risk after change:** Low.

---

## 9. Action Factory (src/lib/action-factory.ts)

### 9.1 Brittle Error Strategy Mapping
**Location:** `handleActionFailure`
**Refactoring Result:** Migrated to **Explicit Type Checking** and implemented a recursive `formatZodError` helper.
**Impact:** Zod errors are now returned as flat, human-readable strings. Standardized on `unknown` error typing.
**Risk after change:** Low.

### 9.2 Structural Layer Inversion (Composition Root)
**Location:** `action-factory.ts`
**Behavior:** Previously mixed logic with singleton instantiation, importing `requireActor` from the feature layer.
**Refactoring Result:** Implemented **Dependency Inversion (Move Composition Root)**. Foundation now only exports the logic; instantiation moved to `src/features/auth/di.ts`.
**Impact:** Foundation is now purely reusable and independent of Auth feature logic.
**Risk after change:** Low.

---

## 10. Summary of Findings

| #   | Category    | Finding                                | Risk | Action |
| --- | ----------- | -------------------------------------- | ---- | ------ |
| 1   | RBAC        | `ADMIN` restricted on `PROJECTS_LIST`  | Med  | Preserve |
| 2   | RBAC        | `PUBLIC` bypasses security             | High | Preserve |
| 3   | UI          | Double rendering (Mobile/Desktop)      | Med  | ✅ Refactored |
| 4   | Search      | Cache never cleared in hook            | Low  | ✅ Refactored |
| 5   | Camera      | Missing `revokeObjectURL`              | Low  | ✅ Refactored |
| 6   | Sidebar     | Manual category repetition             | Low  | ✅ Refactored |
| 7   | JWT         | Exception-based flow control           | Low  | ✅ Refactored |
| 8   | Error       | Hardcoded localized messages           | Low  | ✅ Refactored |
| 9   | DI          | Structural layer inversion             | Low  | ✅ Refactored |
| 10  | Factory     | Brittle error mapping                  | Low  | ✅ Refactored |
| 11  | RBAC        | Greedy path matching                   | Low  | ✅ Refactored |

**⚠️ Characterization Complete. Proceed to Phase 3: Map.**
