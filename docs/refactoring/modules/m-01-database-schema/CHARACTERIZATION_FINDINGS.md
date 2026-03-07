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

---

## 2. Summary of Findings

| #   | Category | Finding | Risk Level | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Relations** | 5x relations between User and LogSheet | High | **Locked** |
| 2 | **Soft-Delete** | Unified `deletedAt` confirmed across all models | Low | **Fixed/Locked** |
| 3 | **Integrity** | Machine-Entry relation is structurally unconstrained | Medium | **Documented** |
| 4 | **Recursive** | Project Addenda uses `parentProjId` field | Medium | **Verified** |

---

## 3. Test Coverage Summary

**Characterization / Structural Tests:**
- `src/__tests__/m01-schema-characterization.test.ts` (PASS) - Locks in the top 5 risky structural contracts.

| Category | Description | Status |
| :--- | :--- | :--- |
| **Relations** | 5x User-LogSheet domain coupling | **Verified & Locked** |
| **Soft-Delete** | Strategy alignment across all models | **Verified & Locked** |
| **Implicit Contracts** | Machine-Entry lack of enforcement | **Verified & Locked** |
| **Recursive** | Project Addenda relationship | **Verified & Locked** |
| **Enums/Defaults** | Critical status defaults (IDLE, PENDING) | **Verified & Locked** |

**Total:** 5 characterization tests (All Passing)

---

## 4. E2E / Critical User Journeys

**End-to-End Scenarios identified to verify schema-supported logic:**

| # | Scenario Name | Description | Related Schema Risk |
| :--- | :--- | :--- | :--- |
| **1** | **The Log Sheet "Five-Sign-Off" Cycle** | Create -> Submit -> Approve -> Tech Sign -> Client Sign. | 1.1 Multi-Relation Bottleneck |
| **2** | **Project Hierarchy (Addendum) Lifecycle** | Create Base Project -> Link Addendum via `parentProjId` -> Close Parent. | 1.4 Recursive Structure |
| **3** | **Machine-Specific Entry Integrity** | Assign Machines to LogSheet -> Enter data for assigned vs unassigned machines. | 1.3 Implicit Contract |

---

### E2E Test Scenarios (Pseudo-spec)

#### CUJ-01: Log Sheet Sign-off
1. **Pre-condition**: A Project exists with at least one Technician and one Client PIC assigned.
2. **Action**: 
   - `POST /api/log-sheets` (Draft)
   - `PATCH /api/log-sheets/[id]/submit` (links `submittedById`)
   - `PATCH /api/log-sheets/[id]/approve` (links `approvedById`)
   - `POST /api/log-sheets/[id]/signatures` (links `technicianSignedById` and `clientPicSignedById`)
3. **Verification**: `GET /api/log-sheets/[id]` returns a model with all 5 User relations populated.

#### CUJ-02: Project Addenda
1. **Action**:
   - `POST /api/projects` (UTAMA)
   - `POST /api/projects` (ADDENDUM, `parentProjId` = id of first project)
2. **Verification**: 
   - Parent `GET` shows Addendum in `addenda` array.
   - Child `GET` shows Parent in `parentProject` object.

#### CUJ-03: Machine Entry Validation
1. **Action**:
   - `POST /api/log-sheets/[id]/entries` with `machineId` of a machine NOT in the log sheet's machine list.
2. **Verification**: Application returns `400 Bad Request` (verifying that the implicit contract is enforced by the service layer).
