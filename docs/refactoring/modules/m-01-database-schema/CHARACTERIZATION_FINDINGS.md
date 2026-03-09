# M-01: Database Schema — Characterization Test Findings

> Date: 2026-03-07 (Updated)

This document captures structural invariants and surprising behaviors discovered in the Prisma schema. These must be preserved or explicitly migrated during refactoring.

---

## 1. Schema Invariants & Surprises

### 1.1 Multi-Relation User-LogSheet Bottleneck
**Location:** `prisma/schema/users.prisma` and `prisma/schema/log-sheets.prisma`

**Behavior:** A `User` has 5 separate relations to `LogSheet` (replaced, submitted, approved, technician signed, client PIC signed).
**Implication:** Extremely tight coupling between the User and LogSheet domains. Any change to User identity or LogSheet structure requires updating all 5 relation definitions.
**Risk if changed:** High

### 1.2 Soft-Delete Strategy (Resolved Inconsistency)
**Location:** Global (Verified in `notifications.prisma` and `summary-reports.prisma`)

**Behavior:** Previous documentation flagged `Notification` and `SummaryReport` as missing `deletedAt`. Verified as of 2026-03-07 that **all core models now include `deletedAt`**.
**Implication:** A unified soft-delete strategy can be applied across the entire application without exceptions.
**Status:** ✅ Fixed (Characterized to prevent regression)

### 1.3 Machine-Entry Implicit Contract
**Location:** `prisma/schema/log-sheets.prisma`

**Behavior:** `LogSheetEntry` has an optional `machineId`, but there is no schema-level constraint ensuring that this `machineId` belongs to the `LogSheetMachine` set associated with that specific log sheet.
**Implication:** Data integrity for machine-specific log entries depends entirely on application-layer validation.
**Risk if changed:** Medium (Implicit contract)

### 1.4 Project Addenda Recursive Structure
**Location:** `prisma/schema/projects.prisma`

**Behavior:** The `Project` model uses a recursive relation named `ProjectAddendumParent` with the foreign key `parentProjId` (not `parentProjectId`).
**Implication:** The system supports a hierarchy of projects (Addenda). Logic that aggregates project data must account for this recursive structure.
**Risk if changed:** Medium

### 1.5 Function-Level Surprises (Risky Logic)

#### 1.5.1 The "Upsert-Sync" Assignment Logic
**Location:** `src/features/projects/service.ts` (`setProjectAssignments`)

**Behavior:** Instead of a simple "set" or "delete-all-then-reinsert", this function performs a three-stage synchronization:
1. Fetch existing active assignments.
2. `upsert` all incoming assignments (creating or re-activating).
3. Identify existing assignments *missing* from the incoming list and `update` them to `isActive: false` with an `endDate`.
**Implication:** History is strictly preserved. Soft-delete is enforced even at the join-table level.
**Risk:** High complexity in transaction management.

#### 1.5.2 Recursive Tree Update (Lab Analysis)
**Location:** `src/features/lab-analyses/service.ts` (`updateLabAnalysis`)

**Behavior:** Updating a single `LabAnalysis` triggers a recursive update of `LabAnalysisColumn` and `LabAnalysisEntry` trees. It uses internal "Temp ID" mapping to bridge client-side temporary IDs with server-side database IDs.
**Implication:** Extremely fragile. A failure in one leaf (entry) can roll back the entire analysis update.
**Risk:** High (Transaction nesting and state mapping).

#### 1.5.3 Business-Layer Unique Constraints
**Location:** `src/features/projects/service.ts` (`createProject`)

**Behavior:** The function performs an explicit `prisma.project.findFirst` check for duplicate project names before creation.
**Implication:** This unique constraint is NOT enforced by the database schema (Prisma), meaning a race condition or direct DB edit could bypass it. It is a "Business Unique" rule.
**Risk:** Medium (Data integrity drift).

#### 1.5.4 Generic Security Failure Pattern
**Location:** `src/features/auth/service.ts` (`authenticateUser`)

**Behavior:** Every failure path (user not found, password mismatch, user blocked, user inactive) throws the *exact same* error message.
**Implication:** Specifically designed to prevent account enumeration attacks.
**Risk:** Low (Security requirement).

---

## 2. Summary of Findings

| #   | Category | Finding | Risk Level | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Relations** | 5x relations between User and LogSheet | High | **Locked** |
| 2 | **Soft-Delete** | Unified `deletedAt` confirmed across all models | Low | **Fixed/Locked** |
| 3 | **Integrity** | Machine-Entry relation is structurally unconstrained | Medium | **Documented** |
| 4 | **Recursive** | Project Addenda uses `parentProjId` field | Medium | **Verified** |
| 5 | **Logic** | "Upsert-Sync" logic for Project Assignments | High | **Characterized** |
| 6 | **Logic** | Recursive Tree Update for Lab Analysis | High | **Characterized** |

---

## 3. Test Coverage Summary

**Characterization / Structural Tests:**
- `src/__tests__/m01-schema-characterization.test.ts` (PASS) - Locks in the top 5 risky structural contracts.
- `src/__tests__/m01-functions-characterization.test.ts` (PASS) - Locks in the behavior of the top 5 riskiest DB-interacting functions.

| Category | Description | Status |
| :--- | :--- | :--- |
| **Structural** | 5x User-LogSheet domain coupling | **Verified & Locked** |
| **Structural** | Soft-Delete Strategy alignment | **Verified & Locked** |
| **Structural** | Machine-Entry lack of enforcement | **Verified & Locked** |
| **Functional** | Project Assignment "Upsert-Sync" logic | **Verified & Locked** |
| **Functional** | Lab Analysis Recursive Update | **Verified & Locked** |
| **Functional** | Auth "Generic Error" security pattern | **Verified & Locked** |

**Total:** 10 characterization tests (All Passing)

---

## 4. E2E / Critical User Journeys (Re-Identified)

These scenarios represent the most complex, high-risk, and business-critical flows in the system. They exercise the complex `prisma.$transaction` logic and multi-model relationships.

| # | Journey Name | Critical Value | Schema/Logic Risk |
| :--- | :--- | :--- | :--- |
| **CUJ-01** | **Project Lifecycle & Resource Orchestration** | Foundation of billing and access. | Recursive Addenda + Sync Assignment Logic |
| **CUJ-02** | **Digital Log Sheet: Field to Sign-off** | Core daily business activity. | 5x User Relations + Transactional signatures |
| **CUJ-03** | **Analytical Monitoring: Lab Analysis Lifecycle** | Compliance and technical health. | Recursive Tree Update + Dynamic Columns |

---

### E2E Test Scenarios (Execution Specs)

#### CUJ-01: Project Lifecycle & Resource Orchestration
*   **Goal**: Verify that projects can be branched (Addenda) and personnel can be synced without losing history.
*   **Steps**:
    1.  **Create UTAMA**: Create a base project "P-001".
    2.  **Assign Team**: Set assignments for 2 Technicians and 1 Supervisor using the "Sync" logic.
    3.  **Branch Addendum**: Create project "P-001-A1" linking `parentProjId` to "P-001".
    4.  **Sync/Update Assignments**: Update "P-001" assignments by removing 1 Tech and adding a new one.
*   **Success Criteria**:
    -   `P-001-A1` is correctly linked in the recursive hierarchy.
    -   Removed assignment is marked `isActive: false` with an `endDate` (not deleted).
    -   New assignment is `isActive: true`.

#### CUJ-02: Digital Log Sheet: Field to Sign-off
*   **Goal**: Ensure the "Five-Sign-Off" state machine works through its transactional stages.
*   **Steps**:
    1.  **Draft**: Technician creates a Log Sheet with machine entries and chemical usage.
    2.  **Submit**: Technician submits (sets `submittedById`, status `SUBMITTED`).
    3.  **Approve**: Supervisor reviews and approves (sets `approvedById`, status `APPROVED`).
    4.  **Field Signature**: Technician provides a digital signature in the field (sets `technicianSignedById`).
    5.  **Client Sign-off**: Client PIC signs the report (sets `clientPicSignedById`).
*   **Success Criteria**:
    -   All 5 User-relation fields in the Log Sheet model are correctly populated.
    -   Status transitions are enforced (cannot approve a draft).
    -   Signatures are correctly linked to the specific authenticated actors.

#### CUJ-03: Analytical Monitoring: Lab Analysis Lifecycle
*   **Goal**: Verify the complex recursive update of lab analyses and dynamic column mapping.
*   **Steps**:
    1.  **Initialize**: Create a Lab Analysis with 3 columns (Units) and 5 parameters.
    2.  **Populate**: Enter data for all 15 cells (3x5 grid).
    3.  **Dynamic Update**: Add a 4th column and remove the 2nd column; update 10 parameter values.
    4.  **Automatic Raw Water**: Ensure the "Raw Water" system-column is automatically preserved/synced.
*   **Success Criteria**:
    -   The `updateLabAnalysis` transaction successfully maps "Temp IDs" to real IDs.
    -   Removed column and its entries are soft-deleted.
    -   Data for the 4th column is persisted correctly in the new grid layout.
    -   Audit logs show the transition of state.
