# M-01: Database Schema — Refactoring Plan

The database schema is the foundation of CPIS. While currently functional and modularized into separate `.prisma` files, it suffers from inconsistent soft-delete standardization and two "God Modules" (`log-sheets.prisma`, `projects.prisma`) that act as domain nexus points.

---

## 1. Refactoring Priority Matrix

Priority = f(Pain, Risk, Value)

| Area                 | Pain Level | Risk Level | Business Value | Priority | Evidence                     |
| -------------------- | ---------- | ---------- | -------------- | :------: | ---------------------------- |
| Soft-Delete Stand.   | Low        | Medium     | High           |    P1    | `deletedAt` commented out in 2 files. |
| Performance Indexing | Low        | Low        | Medium         |    P2    | Characterized index gaps in Users/Notifications. |
| Project Domain Hub   | Medium     | High       | Critical       |    P3    | Recursive addenda + complex assignments. |
| Log Sheet God Module | High       | High       | Critical       |    P4    | Nexus for 5 domains; 125 LOC schema. |

---

## 2. Refactoring Order Rationale

> **LOW risk → MEDIUM risk → HIGH risk**

1. **Step 1: Leaf Standardization** — Resolve deferred soft-delete fields in `notifications` and `summary-reports`.
2. **Step 2: Performance & Integrity** — Add characterized indexes and unique constraints to `users` and `parameters`.
3. **Step 3: Hub Modularization** — Split complex relations in `projects` and `log-sheets` if possible (within Prisma limitations).

---

## 3. Testing Strategy

> **"Lock current behavior, not test results."**

### What to test first

| Priority | What         | Why                            | Type |
| :------: | ------------ | ------------------------------ | ---- |
|    1     | Schema Struct| Lock structural invariants.    | Char. |
|    2     | DB Functions | Ensure transactions survive migration. | Char. |

---

## 4. Phased Execution

### Phase 1: Foundation — Standardization (Low/Med Risk)

- [ ] **Task 1.1**: Standardize Soft-Delete. Add/Uncomment `deletedAt` in `notifications.prisma` and `summary-reports.prisma`.
- [ ] **Task 1.2**: Standardize Timestamps. Ensure all models (except junction tables) have `createdAt` and `updatedAt`.
- [ ] **Task 1.3**: Sync Schema. Run `prisma generate` and verify no type regressions in `M-02` (Auth).

### Phase 2: Performance & Integrity (Medium Risk)

- [ ] **Task 2.1**: User Performance. Add index on `User(email, isActive)` and `User(role, isActive)`.
- [ ] **Task 2.2**: Notification Performance. Ensure compound index on `userId` and `isRead`.
- [ ] **Task 2.3**: Parameter Constraints. Formalize business-unique names where missing.

### Phase 3: Hub Modularization (High Risk)

- [ ] **Task 3.1**: Project Hub Cleanup. Rename recursive fields to project standard (`parentProjectId`) ONLY if verified safe by characterization tests.
- [ ] **Task 3.2**: Log Sheet Nexus. Extract machine-specific entry logic into sub-models if schema allows better decoupling.

---

## 5. Verification Plan

- [ ] `npx prisma validate` passes.
- [ ] `npm run build` passes (Total type-safety check).
- [ ] `src/__tests__/m01-schema-characterization.test.ts` passes.
- [ ] `src/__tests__/m01-functions-characterization.test.ts` passes.
