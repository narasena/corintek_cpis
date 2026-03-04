# M-01: Database Schema — Refactoring Plan

The database schema is currently split into 14 domain-specific files. While this provides good separation, there are inconsistencies in soft-delete implementation and heavy coupling in core domains (Log Sheets and Users). The goal is to standardize the schema foundations without breaking existing relations.

---

## 1. Refactoring Priority Matrix

Priority = f(Pain, Risk, Value)

| Area                       | Pain Level | Risk Level | Business Value | Priority | Evidence                                      |
| -------------------------- | ---------- | ---------- | -------------- | :------: | --------------------------------------------- |
| Soft-Delete Consistency    | Medium     | Low        | High           |    P1    | Inconsistent `deletedAt` fields across models |
| Timestamp Standardization  | Low        | Low        | Medium         |    P2    | Ensure all models have `createdAt`/`updatedAt`|
| Log Sheet Relation Cleanup | High       | High       | Medium         |    P3    | 5x relations to User is a maintenance burden  |
| Schema Documentation       | Low        | Low        | High           |    P1    | Lack of comments explaining implicit contracts|

---

## 2. Refactoring Order Rationale

> **LOW risk → MEDIUM risk → HIGH risk**

1. **Foundation (Low Risk)**: Standardize `deletedAt` and timestamps in Leaf domains (Attendance, Notifications, Summary Reports).
2. **Master Data (Low/Medium Risk)**: Verify and standardize Parameters, Clients, and Machines.
3. **Complex Transactions (Medium Risk)**: Lab Analyses and Chemicals.
4. **Core Anchors (High Risk)**: Projects, Users, and finally Log Sheets.

---

## 3. Testing Strategy

> **"Lock current behavior, not test results."**

### What to test first

| Priority | What              | Why                                        | Type        |
| :------: | ----------------- | ------------------------------------------ | ----------- |
|    1     | Schema Validation | Ensure `npx prisma validate` passes        | Tooling     |
|    2     | Relation Integrity| Verify foreign keys aren't broken by shifts| Integration |
|    3     | Seed Consistency  | Ensure `prisma db seed` still works        | E2E/Data    |

---

## 4. Phased Execution

### Phase 1: Foundation — Consistency & Documentation

- [ ] Add `deletedAt` to `notifications.prisma` and `summary-reports.prisma`.
- [ ] Add missing comments to models explaining their purpose and relations.
- [ ] Standardize `@map` naming conventions across all files if any drift exists.

### Phase 2: Structural Verification

- [ ] Resolve the `prisma.config.ts` loading issue to enable `prisma validate`.
- [ ] Run `npx prisma format` to ensure consistent indentation and style.

### Phase 3: Relation Optimization (High Risk - Requires Caution)

- [ ] Evaluate if `LogSheet` relations to `User` can be grouped or simplified (e.g., using a single "Signatories" table) — **Only if deemed necessary after M-02 analysis.**

---

## 5. Verification Plan

- [ ] `npm run prisma:validate` passes without errors.
- [ ] `npm run prisma:generate` produces correct types.
- [ ] `npm run prisma:seed` executes successfully on a fresh DB (if possible in env).
- [ ] All existing repository tests (Prisma-based) pass.
