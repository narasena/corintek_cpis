# M-01: Database Schema — Characterization Test Findings

> Date: 2026-03-04

This document captures surprising/buggy behavior discovered while analyzing the Prisma schema structure. These behaviors are **current behavior** that should be preserved during refactoring.

---

## 1. Schema Invariants & Surprises

### 1.1 Multi-Relation User-LogSheet Bottleneck

**Location:** `prisma/schema/users.prisma` and `prisma/schema/log-sheets.prisma`

**Behavior:** A `User` has 5 separate relations to `LogSheet`:
1. `replacedLogSheets` -> `LogSheet.replacedBy`
2. `submittedLogSheets` -> `LogSheet.submittedBy`
3. `approvedLogSheets` -> `LogSheet.approvedBy`
4. `technicianSignedLogSheets` -> `LogSheet.technicianSignedBy`
5. `clientPicSignedLogSheets` -> `LogSheet.clientPicSignedBy`

**Implication:** This creates a heavy coupling between the User and LogSheet domains. Any change to the User model's ID or the LogSheet model's relationship fields requires a synchronized update across both schema files.

**Risk if changed:** High

### 1.2 Soft-Delete Inconsistency

**Location:** `prisma/schema/notifications.prisma`, `prisma/schema/summary-reports.prisma`

**Behavior:** These models are missing the `deletedAt` field, while it is consistently applied to all other core models (`User`, `Project`, `LogSheet`, `Machine`, `Chemical`, etc.).

**Implication:** Queries for "active" records using a global soft-delete filter will fail or behave inconsistently for these specific models.

**Risk if changed:** Medium

### 1.3 Machine-Entry Implicit Contract

**Location:** `prisma/schema/log-sheets.prisma`

**Behavior:** `LogSheetEntry` has an optional `machineId`, but `LogSheetMachine` exists as a join table to track which machines are "active" for a given log sheet.

**Implication:** This implies a two-tier data entry model: some data points are general to the project/log-sheet (machine-less), while others are specific to a machine. The application must ensure that `LogSheetEntry.machineId` always refers to one of the machines listed in `LogSheetMachine` for that log sheet, but this is an **implicit contract** not enforced by the schema level.

**Risk if changed:** Medium

---

## 2. Summary of Findings

| #   | Location                  | Finding                               | Risk Level | Action Needed      |
| --- | ------------------------- | ------------------------------------- | ---------- | ------------------ |
| 1   | users.prisma / log-sheets.prisma | Multiple relations (5x)               | High       | Document carefully |
| 2   | Multiple files            | Soft-delete inconsistency             | Medium     | Align in refactor  |
| 3   | log-sheets.prisma         | Implicit Machine-Entry contract       | Medium     | Verify in tests    |
| 4   | projects.prisma           | Recursive Project Addenda structure   | Medium     | Protect relations  |

---

## 3. Test Coverage Summary

**Proposed test files (Characterization/Golden Tests):**

1. `src/features/database/schema-validation.test.ts` (Intended: Validate schema constraints via record instantiation)

**Total:** 0 characterization tests (Blocked by local environment database configuration; findings based on structural analysis)

---

## 4. E2E / Critical User Journeys

**End-to-End Scenarios identified to run against the full application:**

| #   | Scenario Name           | Description                                                        | Status    |
| --- | ----------------------- | ------------------------------------------------------------------ | --------- |
| 1   | Log Sheet Life Cycle    | Create (Draft) -> Submit -> Approve -> Sign (Tech) -> Sign (Client) | {Pending} |
| 2   | Project Addendum        | Create Parent Project -> Create Addendum -> Verify Relation        | {Pending} |
| 3   | Soft Delete Persistence | Delete a project -> Ensure related log sheets remain in DB         | {Pending} |
