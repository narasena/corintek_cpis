# Test Coverage Analysis - Log Sheets Module (Fullstack)

**Generated:** 2026-02-21  
**Scope:** `src/features/log-sheets/` + `src/app/(main)/log-sheets/`

---

## 1. Current Test Coverage Summary

### Backend / Feature Layer (`src/features/log-sheets/`)

| File                                  | Lines | Coverage    | Notes                                              |
| ------------------------------------- | ----- | ----------- | -------------------------------------------------- |
| `log-sheet-locking.ts`                | 40    | **100%** ✅ | Pure function, fully tested                        |
| `log-sheet-status.ts`                 | 55    | **100%** ✅ | State machine, fully tested                        |
| `validation.ts`                       | 222   | **~60%**    | `validateLogSheetEntries` tested; internal fns not |
| `approval-validation.ts`              | 200   | **~40%**    | Only `validateLogSheetApprovalDetail` tested       |
| `utils.ts`                            | 38    | **~80%**    | `makeEntryKey`, `isLogSheetEntryEmpty` indirect    |
| `types.ts`                            | 203   | **0%** ❌   | Zod schemas untested                               |
| `service.ts`                          | 1009  | **0%** ❌   | All 15+ functions untested                         |
| `actions.ts`                          | 591   | **0%** ❌   | All 13 server actions untested                     |
| `option-a/unit-view-model-builder.ts` | -     | **100%** ✅ | Fully tested                                       |
| `option-a/mobile-view-adapter.ts`     | -     | **~80%**    | Tested via builder tests                           |
| `components/signature-section.tsx`    | -     | **0%** ❌   | No tests                                           |
| `components/signature-pad.tsx`        | -     | **0%** ❌   | No tests                                           |
| `components/log-sheet-preview.tsx`    | -     | **0%** ❌   | No tests                                           |
| `components/log-sheet-header.tsx`     | -     | **0%** ❌   | No tests                                           |

### Frontend / UI Layer (`src/app/(main)/log-sheets/`)

| File                                     | Lines | Coverage    | Notes                                 |
| ---------------------------------------- | ----- | ----------- | ------------------------------------- |
| `[projectId]/page.tsx`                   | -     | **0%** ❌   | List page untested                    |
| `[projectId]/[logSheetId]/page.tsx`      | ~1300 | **~30%**    | Characterization tests for UI flow    |
| `[projectId]/[logSheetId]/utils.ts`      | 47    | **~90%** ✅ | formatDate, formatLimit, isOutOfRange |
| `[projectId]/[logSheetId]/types.ts`      | -     | **0%**      | Type definitions only                 |
| `hooks/use-log-sheet-active-machines.ts` | 110   | **~80%** ✅ | Toggle, select all, clear tested      |
| `hooks/use-log-sheet-derived.ts`         | 108   | **~90%** ✅ | Categories, params, machines derived  |
| `hooks/use-log-sheet-draft-state.ts`     | 93    | **~85%** ✅ | State initialization tested           |
| `hooks/use-log-sheet-validation.ts`      | 80    | **~70%**    | Wrapper around validation.ts          |
| `hooks/use-log-sheet-draft-saver.ts`     | 156   | **0%** ❌   | Complex save logic untested           |
| `hooks/use-log-sheet-detail-data.ts`     | -     | **0%** ❌   | Data fetching hook untested           |
| `hooks/use-log-sheet-technicians.ts`     | -     | **0%** ❌   | Technician lookup untested            |
| `hooks/use-mobile-unit-view-model.ts`    | -     | **~80%** ✅ | Mobile adapter tested                 |
| `components/columns.tsx`                 | -     | **0%** ❌   | Table columns                         |
| `components/log-sheet-form.tsx`          | -     | **0%** ❌   | Form component                        |
| `components/log-sheet-dialog.tsx`        | -     | **0%** ❌   | Dialog component                      |
| `components/chemical-usage-section.tsx`  | -     | **0%** ❌   | Chemical input                        |
| `components/mobile-entry-card.tsx`       | -     | **0%** ❌   | Mobile card                           |
| `components/project-columns.tsx`         | -     | **0%** ❌   | Project list columns                  |

### Overall Estimate

| Layer                     | Estimated Coverage |
| ------------------------- | ------------------ |
| Backend (service/actions) | **~5%**            |
| Backend (pure functions)  | **~70%**           |
| Frontend Hooks            | **~50%**           |
| Frontend Components       | **~5%**            |
| **OVERALL**               | **~25-30%**        |

---

## 2. Critical Paths Lacking Tests

### HIGH RISK - Backend Service Layer

| Path                                | File                  | Risk         | Impact                            |
| ----------------------------------- | --------------------- | ------------ | --------------------------------- |
| `upsertLogSheetEntries` transaction | `service.ts:780-885`  | **CRITICAL** | Data corruption, orphaned entries |
| `updateLogSheetStatus`              | `service.ts:420-486`  | **CRITICAL** | Unauthorized state transitions    |
| `saveLogSheetSignature`             | `service.ts:156-183`  | **CRITICAL** | Signature forgery, audit gaps     |
| `assertLogSheetEditable`            | `service.ts:73-108`   | **CRITICAL** | Authorization bypass              |
| `assertCanSignLogSheet`             | `service.ts:112-154`  | **CRITICAL** | Role escalation                   |
| `validateLogSheetForSubmission`     | `service.ts:733-773`  | **HIGH**     | Invalid submissions accepted      |
| `upsertLogSheetMachines`            | `service.ts:286-327`  | **HIGH**     | Cascading soft-delete issues      |
| `upsertLogSheetPhotos`              | `service.ts:887-947`  | **MEDIUM**   | Photo loss                        |
| `upsertLogSheetChemicalUsages`      | `service.ts:949-1007` | **MEDIUM**   | Chemical data loss                |

### HIGH RISK - Frontend Hooks

| Path                          | File                                  | Risk       | Impact                      |
| ----------------------------- | ------------------------------------- | ---------- | --------------------------- |
| `saveDraft` (multi-action)    | `use-log-sheet-draft-saver.ts:37-152` | **HIGH**   | Data loss on save failure   |
| `useLogSheetDetailData` fetch | `use-log-sheet-detail-data.ts`        | **MEDIUM** | Loading/error states        |
| `useLogSheetTechnicians`      | `use-log-sheet-technicians.ts`        | **LOW**    | Wrong technician assignment |

### MEDIUM RISK - Server Actions

| Action                        | File                 | Risk                |
| ----------------------------- | -------------------- | ------------------- |
| `saveLogSheetEntriesAction`   | `actions.ts:299-344` | Validation bypass   |
| `saveLogSheetSignatureAction` | `actions.ts:456-524` | R2 upload failure   |
| `uploadLogSheetImageAction`   | `actions.ts:526-590` | File upload failure |

---

## 3. Methods with Zero Test Coverage

### `service.ts` (All exported functions - 1009 lines)

- `createLogSheet`
- `updateLogSheet`
- `updateLogSheetStatus`
- `deleteLogSheet`
- `getLogSheetDetail`
- `getLogSheetsByProject`
- `getAllLogSheets`
- `getLogSheetActiveMachines`
- `upsertLogSheetMachines`
- `upsertLogSheetEntries`
- `upsertLogSheetPhotos`
- `upsertLogSheetChemicalUsages`
- `saveLogSheetSignature`
- `validateLogSheetForSubmission`
- `validateLogSheetForApproval`
- `assertCanCreateLogSheet`
- `getLogSheetProjectId`
- `hasProjectAssignment` (internal)
- `assertLogSheetEditable` (internal)
- `assertCanSignLogSheet` (internal)
- `isEntryComplete` (internal)
- `upsertSingleLogSheetEntry` (internal)

### `actions.ts` (All 13 server actions - 591 lines)

- `getLogSheetsByProjectAction`
- `getAllLogSheetsAction`
- `createLogSheetAction`
- `updateLogSheetAction`
- `updateLogSheetAdminOverrideAction`
- `updateLogSheetStatusAction`
- `submitLogSheetAction`
- `approveLogSheetAction`
- `deleteLogSheetAction`
- `getLogSheetDetailAction`
- `saveLogSheetEntriesAction`
- `saveLogSheetPhotosAction`
- `saveLogSheetChemicalsAction`
- `saveLogSheetMachinesAction`
- `saveLogSheetSignatureAction`
- `uploadLogSheetImageAction`

### `validation.ts` (Internal functions)

- `validateChillers`
- `validateCoolingTowers`
- `collectRawWaterMissing`
- `collectConsumptionMissing`
- `isEmpty`

### Frontend Hooks

- `use-log-sheet-draft-saver.ts` (entire file)
- `use-log-sheet-detail-data.ts` (entire file)
- `use-log-sheet-technicians.ts` (entire file)

### All UI Components (0% coverage)

- `signature-section.tsx`
- `signature-pad.tsx`
- `log-sheet-preview.tsx`
- `log-sheet-header.tsx`
- `chemical-usage-section.tsx`
- `mobile-entry-card.tsx`
- `columns.tsx`
- `log-sheet-form.tsx`
- `log-sheet-dialog.tsx`
- `project-columns.tsx`

---

## 4. Priority Ranking for Test Implementation

| Priority      | Area                                       | Reason                                                     | Effort |
| ------------- | ------------------------------------------ | ---------------------------------------------------------- | ------ |
| **1. URGENT** | `service.ts:upsertLogSheetEntries`         | Core data entry, transaction complexity, soft-delete logic | High   |
| **2. URGENT** | `service.ts:assertLogSheetEditable`        | Security gate, multiple code paths                         | Medium |
| **3. URGENT** | `service.ts:assertCanSignLogSheet`         | Role-based authorization, signature security               | Medium |
| **4. URGENT** | `service.ts:updateLogSheetStatus`          | State machine, permission checks, approval flow            | High   |
| **5. HIGH**   | `use-log-sheet-draft-saver.ts:saveDraft`   | Frontend save orchestration, multi-action coordination     | Medium |
| **6. HIGH**   | `service.ts:validateLogSheetForSubmission` | Pre-submit validation differs from approval                | Medium |
| **7. HIGH**   | `service.ts:saveLogSheetSignature`         | R2 integration, audit trail                                | Medium |
| **8. MEDIUM** | `service.ts:upsertLogSheetMachines`        | Cascading soft-delete of entries                           | Medium |
| **9. MEDIUM** | `actions.ts` (selected)                    | Thin wrappers but critical for error handling              | Low    |
| **10. LOW**   | UI Components                              | React Testing Library integration tests                    | High   |

---

## 5. Existing Test Files

| Test File                                                                | Lines | Target                                        | Type             |
| ------------------------------------------------------------------------ | ----- | --------------------------------------------- | ---------------- |
| `service.test.ts`                                                        | 246   | `approval-validation.ts`                      | Unit             |
| `log-sheet-locking.test.ts`                                              | 122   | `log-sheet-locking.ts`, `log-sheet-status.ts` | Unit             |
| `__tests__/validation.characterization.test.ts`                          | 266   | `validation.ts`                               | Characterization |
| `option-a/unit-view-model-builder.test.ts`                               | 147   | `option-a/unit-view-model-builder.ts`         | Unit             |
| `hooks/__tests__/use-log-sheet-active-machines.characterization.test.ts` | 488   | `use-log-sheet-active-machines.ts`            | Characterization |
| `hooks/__tests__/use-log-sheet-derived.characterization.test.ts`         | 608   | `use-log-sheet-derived.ts`                    | Characterization |
| `hooks/__tests__/use-log-sheet-draft-state.characterization.test.ts`     | 464   | `use-log-sheet-draft-state.ts`                | Characterization |
| `hooks/__tests__/use-log-sheet-validation.characterization.test.ts`      | 420   | `use-log-sheet-validation.ts`                 | Characterization |
| `hooks/use-mobile-unit-view-model.test.ts`                               | 243   | `use-mobile-unit-view-model.ts`               | Unit             |
| `__tests__/utils.characterization.test.ts`                               | 107   | `utils.ts`                                    | Characterization |
| `__tests__/page.characterization.test.tsx`                               | 366   | `page.tsx`                                    | Characterization |

**Total test lines: ~3,477**

---

## 6. Recommended Next Steps

### Phase 1: Critical Security & Data Integrity (Week 1)

1. **Mock Prisma client** with `vitest-mock-prisma` or manual mocks
2. **Test `assertLogSheetEditable`** - all status/role permutations
3. **Test `assertCanSignLogSheet`** - all role combinations
4. **Test `upsertLogSheetEntries`** - create/update/soft-delete scenarios

### Phase 2: Core Business Logic (Week 2)

5. **Test `updateLogSheetStatus`** - state transitions, validation triggers
6. **Test `validateLogSheetForSubmission`** - signature checks, range validation
7. **Test `saveLogSheetSignature`** - R2 mock, DB persistence

### Phase 3: Frontend Save Flow (Week 3)

8. **Test `use-log-sheet-draft-saver.ts`** - mock all actions, test error recovery
9. **Test `use-log-sheet-detail-data.ts`** - loading/error states

### Phase 4: Integration Tests (Week 4)

10. **E2E flow tests** - DRAFT → SUBMITTED → APPROVED with all data
11. **Component tests** - critical components (signature, preview)

---

## 7. Test Strategy Notes

### Characterization vs Unit Tests

Current tests are mostly **characterization tests** (documenting existing behavior). These should be:

- Converted to unit tests with explicit assertions
- Used as regression protection during refactoring

### Mocking Strategy

```typescript
// Recommended Prisma mock pattern
vi.mock('@/lib/prisma', () => ({
  prisma: {
    logSheet: {
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    logSheetEntry: {
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    // ... other models
  },
}));
```

### Coverage Targets

| Layer             | Current | Target |
| ----------------- | ------- | ------ |
| Service functions | 0%      | 80%    |
| Server actions    | 0%      | 60%    |
| Frontend hooks    | 50%     | 80%    |
| Pure functions    | 70%     | 95%    |
