# M-01: Database Schema — Refactoring Plan

This plan outlines the staged refactoring of the CPIS Prisma schema to reduce domain coupling, enforce data integrity, and standardize structural patterns.

---

## 1. Refactoring Priority Matrix

Priority = f(Pain, Risk, Value)

| Area | Pain Level | Risk Level | Business Value | Priority | Evidence |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Log-Sheet Coupling** | High | High | Critical | **P1** | 5x separate User relations creating a nexus of coupling. |
| **Machine-Entry Integrity** | Med | Med | High | **P1** | Implicit contract between LogSheetMachine and LogSheetEntry. |
| **Project Hierarchy** | Med | High | Med | **P2** | Recursive `parentProjId` structure; naming inconsistency. |
| **Lab Analysis Complexity** | Med | Med | Med | **P3** | Complex 3-model relationship for parameters/columns. |
| **Schema Standardization** | Low | Low | Low | **P4** | Ensure `deletedAt` and timestamps are 100% consistent. |

---

## 2. Refactoring Order Rationale

> **LOW risk → MEDIUM risk → HIGH risk**

1.  **Phase 1: Standardization (LOW)** — Verify leaf modules (`attendance`, `notifications`, `parameters`).
2.  **Phase 2: Data Integrity (MEDIUM)** — Resolve implicit contracts in `machines` and `lab-analyses`.
3.  **Phase 3: Domain Decoupling (HIGH)** — Tackle the `log-sheets` and `users` relation bottleneck.

---

## 3. Testing Strategy

> **"Lock structural contracts via characterization tests before any migration."**

### What to test first

| Priority | What | Why | Type |
| :---: | :--- | :--- | :--- |
| 1 | Relation Fields | Ensure all 5 User-LogSheet relations are preserved/mapped correctly. | Characterization |
| 2 | Unique Constraints | Ensure multi-field unique constraints (ProjectAssignment) are locked. | Characterization |
| 3 | Default Values | Verify `IDLE`, `PENDING`, etc. defaults are preserved. | Characterization |

---

## 4. Phased Execution

### Phase 1: Leaf Standardization & Cleanup (LOW RISK)
- [ ] **Standardize Timestamps**: Ensure `createdAt`, `updatedAt`, and `deletedAt` are present in all models (verify `clients.prisma`, `parameters.prisma`).
- [ ] **Enum Audit**: Standardize naming for `ProjectStatus` and `UserRole` members.
- [ ] **Doc Cleanup**: Add missing model-level comments for generated documentation.

### Phase 2: Integrity & Logic Decoupling (MEDIUM RISK)
- [ ] **Machine-Entry Contract**: Strengthen the relationship between `LogSheetEntry` and `Machine`. Consider adding a composite relation or service-layer validation hooks.
- [ ] **Lab Analysis Refactor**: Simplify the link between `LabAnalysis`, `LabAnalysisColumn`, and `LabAnalysisEntry` to reduce join depth.
- [ ] **Summary Report Alignment**: Ensure `SummaryReport` correctly aggregates from all transactional modules.

### Phase 3: The Log-Sheet Nexus (HIGH RISK - Core Refactor)
- [ ] **User-LogSheet Decoupling**: Evaluate moving the 5x sign-off relations to a separate `LogSheetSignOff` model to reduce `User` model weight.
- [ ] **Project Addenda Standard**: Rename `parentProjId` to `parentProjectId` for consistency with standard naming patterns (`clientId`, `userId`).
- [ ] **Composite Unique Constraints**: Add missing unique constraints found during Phase 2 characterization (e.g. enforcing one active assignment per user/project/role).

---

## 5. Verification Plan

- [ ] **npx prisma validate**: Must pass after every change.
- [ ] **npx prisma generate**: Must generate client without errors.
- [ ] **npm run build**: Full project build to verify downstream type compatibility.
- [ ] **Characterization Tests**: All 9+ tests in `src/__tests__/m01-schema-characterization.test.ts` must pass.
- [ ] **Migrations Audit**: Review `prisma migrate dev` output to ensure no accidental data loss.
