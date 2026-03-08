# M-04: Users — Refactoring Plan

Module M-04 (Users) is a core master data module. It currently suffers from a "God Component" in `UserForm.tsx` and a "Thick Service" in `service.ts` with minor code duplication in `service-admin.ts`. The goal is to improve maintainability by separating concerns and reducing cyclomatic complexity.

---

## 1. Refactoring Priority Matrix

Priority = f(Pain, Risk, Value)

| Area | Pain Level | Risk Level | Business Value | Priority | Evidence |
| ---- | ---------- | ---------- | -------------- | :------: | -------- |
| Service Layer | High | High | Critical | P1 | Core auth/user logic, 300+ LOC |
| User Form | High | High | High | P1 | God Component, 400+ LOC, complex branches |
| Admin Service | Low | Low | Medium | P3 | Minor duplication, isolated |
| Profile Form | Medium | Medium | Medium | P2 | R2 integration, separate path |

---

## 2. Refactoring Order Rationale

> **LOW risk → MEDIUM risk → HIGH risk**

1. **Foundation (Low Risk)**: Consolidate `service-admin.ts` into `service.ts` or a unified utility to kill duplication (DUP-1, DUP-2).
2. **UI Cleanup (Medium Risk)**: Refactor `ProfileForm.tsx` to use shared hooks/components.
3. **Core Service (High Risk)**: Refactor `service.ts` into smaller, focused domain functions (e.g., `PasswordService`, `UserQueryService`).
4. **God Component (High Risk)**: Decompose `UserForm.tsx` into smaller sub-components (e.g., `BasicInfoFields`, `RoleAssignmentFields`).

---

## 3. Testing Strategy

> **"Lock current behavior, not test results."**

### What to test first

| Priority | What | Why | Type |
| :------: | ---- | --- | ---- |
| 1 | `service.ts` | High fan-out, core auth dependency | Characterization |
| 2 | `actions.ts` | Entry point for all UI interactions | Action/Unit |
| 3 | `UserForm` | Complex conditional rendering | E2E |

---

## 4. Phased Execution

### Phase 1: Service Consolidation (Low Risk)
- [x] **1.1 Move Admin Utilities**: Move `restoreUser` and `permanentlyDeleteUser` from `service-admin.ts` to `service.ts`.
- [x] **1.2 Clean Duplication**: Remove redundant `UserSelect` in `service-admin.ts` and use `toUserResponse` mapper from `utils.ts` (Resolves DUP-1, DUP-2).
- [x] **1.3 Validate**: Run all 54 tests.

### Phase 2: Action & Hook Abstraction (Medium Risk)
- [ ] **2.1 Extract Client Fetching**: Create a reusable hook for fetching the clients list used in `UserForm`.
- [ ] **2.2 Cleanup Actions**: Standardize revalidation paths and error handling in `actions.ts`.
- [ ] **2.3 Profile Form**: Refactor `ProfileForm` to use the standardized error handling.

### Phase 3: Service Decomposition (High Risk)
- [ ] **3.1 Extract Password Logic**: Move hashing/verification check to a focused helper if reused.
- [ ] **3.2 Split `service.ts`**: Separate "Read" operations (queries) from "Write" operations (mutations) to reduce file size.
- [ ] **3.3 RBAC Cleanup**: Address inconsistent RBAC check in `getTechniciansList` (Characterization Finding 1.1).

### Phase 4: UI Decomposition (High Risk)
- [ ] **4.1 Split `UserForm`**: Decompose the 400-line `UserForm` into `UserBasicFields`, `UserSecurityFields`, and `UserClientFields`.
- [ ] **4.2 Mode Separation**: Extract `EditUserLogic` and `CreateUserLogic` into separate hooks or helper functions to reduce component branches.

---

## 5. Verification Plan
- [ ] **Test Regression**: Run 54+ unit/characterization tests.
- [ ] **E2E Validation**: Run `src/__tests__/e2e/users/user-management.spec.ts`.
- [ ] **Complexity Check**: Ensure no function > 30 lines.
- [ ] **Doc Update**: Update `BASELINE_INVENTORY.md` with "After" metrics.
