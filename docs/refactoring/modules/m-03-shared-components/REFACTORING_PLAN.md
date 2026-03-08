# M-03: Shared Components & Infrastructure — Refactoring Plan

This module provides the foundational UI and infrastructure for the entire CPIS system. Current pain points include structural inversions in DI, greedy RBAC path matching, and minor memory leaks in media/search handling.

---

## 1. Refactoring Priority Matrix

Priority = f(Pain, Risk, Value)

| Area                 | Pain Level | Risk Level | Business Value | Priority | Evidence                                |
| -------------------- | ---------- | ---------- | -------------- | :------: | --------------------------------------- |
| DI Inversion         | Low        | High       | Medium         |  Done    | Reversed foundation-to-feature coupling |
| RBAC Path Matching   | Low        | High       | Critical       |  Done    | Implemented strict boundary matching    |
| Search/Camera Leaks  | Low        | Low        | High           |  Done    | Implemented automatic resource cleanup  |
| DataTable Complexity | Low        | High       | High           |  Done    | Decoupled toolbar and layout logic      |
| Action Error Format  | Low        | Medium     | Medium         |  Done    | Implemented recursive Zod formatting    |
| JWT Result Pattern   | Low        | Low        | High           |  Done    | Standardized on TActionResult           |
| Localization Cleanup | Low        | Low        | Low            |  Done    | Extracted to context-aware constants    |
| Sidebar Repetition   | Low        | Low        | Low            |  Done    | Refactored to Data-Driven Mapping       |

---

## 2. Refactoring Order Rationale

> **LOW risk → MEDIUM risk → HIGH risk**

1. **Quick Wins (Partially Done):** Isolated UI components (`MultiSelect`, `VirtualList`, `AppSidebar`).
2. **Resource Hygiene:** Fixing memory leaks in `CameraInput` and `SearchFilterService`.
3. **UX Standardization:** Improving `ErrorHandlerService` and `ActionFactory` error reporting.
4. **Architectural Realignment:** Reversing DI inversion and tightening RBAC security.

---

## 3. Testing Strategy

### What to test first

| Priority | What               | Why                                | Type |
| :------: | ------------------ | ---------------------------------- | ---- |
|    1     | `canAccess`        | Prevents security regressions      | Unit |
|    2     | `actionFactory`    | Foundation for all server-side ops | Unit |
|    3     | `DataTable`        | Ensures data integrity in views    | E2E  |

---

## 4. Phased Execution

### Phase 1: Resource Hygiene & Quick Wins (LOW to MEDIUM RISK)

- [x] **Task 1.0: Sidebar Dynamic Mapping** (`app-sidebar.tsx`)
  - Migrate hardcoded categories to dynamic configuration array.
- [x] **Task 1.1: Camera Cleanup** (`camera-input.tsx`)
  - Implement `useEffect` cleanup to call `URL.revokeObjectURL` for all previews.
- [x] **Task 1.2: Search Cache Management** (`search-filter-service.ts`)
  - Update `useDataTableSearch` hook to call `searchService.clearCache()` on unmount or query reset.
- [x] **Task 1.3: Localization Cleanup** (`error-handler-service.ts`)
  - Extract hardcoded Indonesian messages into a typed constant dictionary.

### Phase 2: Functional Standardization (MEDIUM to HIGH RISK)

- [x] **Task 2.1: Action Error Formatting** (`action-factory.ts`)
  - Improve Zod error parsing to return human-readable strings instead of JSON blobs to the client.
- [x] **Task 2.2: JWT Result Pattern** (`jwt.ts`)
  - Standardize error results using the `TActionResult` pattern used in newer modules.

### Phase 3: Structural Realignment (HIGH RISK)

- [x] **Task 3.1: Reverse DI Inversion** (`lib/di/factories.ts`)
  - Remove imports from `@/features/*` in the foundational `lib` folder.
  - Move service registration factories to their respective feature directories.
- [x] **Task 3.2: Secure RBAC Paths** (`rbac.ts`)
  - Refactor `matchPathToResource` to prevent greedy matching (e.g., `/users/settings` shouldn't match `/users` unless intended).
- [x] **Task 3.3: DataTable View Decoupling** (`data-table.tsx`)
  - Separate Desktop and Mobile view rendering logic more cleanly.
  - (Optional) Implement a mechanism to prevent dual-DOM rendering for better performance.

---

## 5. Verification Plan

- [x] All 350+ unit tests pass.
- [x] DataTable dual view logic verified via `getAllByText` characterization.
- [ ] E2E suite (`shared-components.spec.ts`) passes across all roles.
- [x] Memory check: Verify ObjectURLs are revoked after clearing image in `CameraInput`.
- [x] Security check: Verify that non-admin sub-paths are correctly blocked by RBAC.
