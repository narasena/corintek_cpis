# M-01: Database Schema — Refactoring Plan (DEFERRED)

**Current Status:** Foundation Standardized (Phase 1 Complete). 
**Strategy:** Defer Phase 2 & 3 refactoring until all application modules (M-02 to M-20) are refactored to minimize global blast radius and avoid breaking the type system during the project transition.

---

## 1. Refactoring Priority Matrix

Priority = f(Pain, Risk, Value)

| Area | Pain Level | Risk Level | Business Value | Priority | Evidence |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Log-Sheet Coupling** | High | High | Critical | **P1 (DEFERRED)** | 5x separate User relations creating a nexus of coupling. |
| **Machine-Entry Integrity** | Med | Med | High | **P1 (DEFERRED)** | Implicit contract between LogSheetMachine and LogSheetEntry. |
| **Project Hierarchy** | Med | High | Med | **P2 (DEFERRED)** | Recursive `parentProjId` structure; naming inconsistency. |
| **Lab Analysis Complexity** | Med | Med | Med | **P3 (DEFERRED)** | Complex 3-model relationship for parameters/columns. |
| **Schema Standardization** | Low | Low | Low | **DONE** | Verified `deletedAt` and timestamps are consistent in all models. |

---

## 2. Refactoring Order Rationale

> **LOW risk → MEDIUM risk → HIGH risk**

1.  **Phase 1: Standardization (DONE)** — Leaf modules verified as compliant.
2.  **Phase 2: Data Integrity (DEFERRED)** — Will be addressed within the context of specific module refactoring (e.g., M-09, M-13).
3.  **Phase 3: Domain Decoupling (DEFERRED)** — Will be addressed at the end of the project or during M-11 refactor.

---

## 3. Testing Strategy

> **"Lock structural contracts via characterization tests before any deferred migration."**

### What to test first

| Priority | What | Why | Type |
| :---: | :--- | :--- | :--- |
| 1 | Relation Fields | Ensure all 5 User-LogSheet relations are preserved/mapped correctly. | Characterization |
| 2 | Unique Constraints | Ensure multi-field unique constraints (ProjectAssignment) are locked. | Characterization |
| 3 | Default Values | Verify `IDLE`, `PENDING`, etc. defaults are preserved. | Characterization |

---

## 4. Phased Execution

### ✅ Phase 1: Leaf Standardization & Cleanup (COMPLETED)
- [x] **Standardize Timestamps**: Confirmed `createdAt`, `updatedAt`, and `deletedAt` are present in all models.
- [x] **Enum Audit**: Standardized naming for `ProjectStatus` and `UserRole` members.
- [x] **Doc Cleanup**: Updated characterization findings with verified data.

### ⏸️ Phase 2: Integrity & Logic Decoupling (DEFERRED)
- [ ] **Machine-Entry Contract**: Defer until M-09: Machines refactoring.
- [ ] **Lab Analysis Refactor**: Defer until M-13: Lab Analyses refactoring.
- [ ] **Summary Report Alignment**: Defer until M-14: Summary Reports refactoring.

### ⏸️ Phase 3: The Log-Sheet Nexus (DEFERRED)
- [ ] **User-LogSheet Decoupling**: Defer until M-11: Log Sheets refactoring.
- [ ] **Project Addenda Standard**: Defer until M-08: Projects refactoring.
- [ ] **Composite Unique Constraints**: Defer until the end of the project to avoid breaking existing migrations.

---

## 5. Verification Plan

- [x] **npx prisma validate**: Passed 🚀
- [x] **npx prisma generate**: Passed (Client updated)
- [x] **npm run build**: Passed (Downstream compatibility verified)
- [x] **Characterization Tests**: All 9+ tests in `src/__tests__/m01-schema-characterization.test.ts` pass.
- [x] **Documentation Updated**: All M-01 docs reflect the DEFERRED status.
