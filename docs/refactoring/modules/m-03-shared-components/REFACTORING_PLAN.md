# M-03: Shared Components & Infrastructure — Refactoring Plan

This module serves as the foundational "Infrastructure" layer for the entire project. The current state contains several God components, duplicated Canvas logic, and a critical circular dependency between the infrastructure layer and the Auth feature.

---

## 1. Refactoring Priority Matrix

Priority = f(Pain, Risk, Value)

| Area                 | Pain Level | Risk Level | Business Value | Priority | Evidence                     |
| -------------------- | ---------- | ---------- | -------------- | :------: | ---------------------------- |
| Auth Helpers (CIR-1) | High       | High       | Critical       |    P1    | Circular Dep with Auth feature |
| Image/Canvas Logic   | Medium     | Medium     | High           |    P2    | Duplicated `getContext('2d')` |
| DataTable            | High       | High       | High           |    P2    | 300+ LOC, God Component      |
| RBAC Configuration   | Low        | High       | Critical       |    P3    | 300+ LOC Config file         |
| Machine Form Section | Medium     | Medium     | Medium         |    P3    | Domain logic leaked to M-03  |

---

## 2. Refactoring Order Rationale

> **LOW risk → MEDIUM risk → HIGH risk**

1. **Step 1: Leaf Utilities** (`r2-upload.ts`, `prisma.ts`, `jwt.ts`) — Clean up interfaces and types.
2. **Step 2: Logic Consolidation** (`image-compression.ts`, `camera-input.tsx`) — Extract raw Canvas manipulation to a dedicated utility to kill DUP-1.
3. **Step 3: Feature Decoupling** (`machine-form-section.tsx`) — Move domain-specific leaks to their respective feature modules (M-09).
4. **Step 4: Core Structural Refactoring** (`auth-helpers.ts`, `rbac.ts`, `data-table.tsx`) — Break down God classes and resolve CIR-1.

---

## 3. Testing Strategy

### What to test first

| Priority | What               | Why                                      | Type |
| :------: | ------------------ | ---------------------------------------- | ---- |
|    1     | Auth Primitives    | High fan-out, critical for security      | Unit |
|    2     | Compression Engine | Prone to silent WebP conversion errors   | Unit |
|    3     | DataTable Tabs     | Complex UI branching (Mobile vs Desktop) | E2E  |

---

## 4. Phased Execution

### Phase 1: Foundation & Quick Wins (Low Risk)
- [x] **F12 (Prisma):** Refactored with Encapsulated Lazy Initialization and environment validation.
- [ ] **F11 (R2):** Ensure strict interface adherence (I/T prefix) and add missing documentation.
- [x] **F10 (Multi-Select):** Extracted `MultiSelectBadge` sub-component and standardized interfaces.
- [x] **F9 (JWT):** Decoupled from feature layer via `src/lib/constants/auth.ts` and implemented discriminated `JWTError` handling.

### Phase 2: Logic Consolidation (Medium Risk)
- [x] **Canvas Extraction (DUP-1):** Created `src/lib/utils/canvas.ts`. Moved common scaling and promisified `toBlob` logic from `image-compression.ts`.
- [x] **F5 (Camera Input):** Refactored to use the unified `processImagePipeline`. Removed redundant internal canvas logic and refs.
- [x] **F7 (Domain Leak):** Moved `machine-form-section.tsx` to its proper domain (`src/features/machines/components/`) and extracted factory helper.
- [x] **F8 (App Sidebar):** Modularized sidebar into subgroups (Operasional, Administrasi, etc.) and extracted schema to `src/lib/constants/navigation.ts`.

### Phase 3: Structural Refactoring (High Risk)
- [x] **F2 (Auth Helpers):** Resolved CIR-1. Split into `src/lib/auth-helpers.ts` (foundational) and `src/features/auth/lib/user-context.ts` (domain-aware).
- [ ] **F4 (DataTable):** Split `data-table.tsx` into `DataTableDesktop` and `DataTableMobile`. Centralize the Tab-switching logic.
- [x] **F3 (RBAC):** Decomposed the massive `ROLE_CONFIG` into modular, role-based policy files in `src/lib/rbac/policies/`. Extracted types to `src/lib/rbac/types.ts`.

---

## 5. Verification Plan
- [ ] Run 71+ Unit/Characterization tests after every Micro-Refactoring.
- [ ] Execute `src/__tests__/e2e/infrastructure/shared-components.spec.ts` after Phase 2 and 3.
- [ ] Verify 0 new circular dependencies via build check.
- [ ] Architecture check: Ensure no domain leaks remaining in `src/lib`.
