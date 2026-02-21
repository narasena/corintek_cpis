# Test Coverage Analysis - Log Sheets Module (Fullstack)

**Generated:** 2026-02-21  
**Updated:** 2026-02-21 (Characterization Tests Added)  
**Scope:** `src/features/log-sheets/` + `src/app/(main)/log-sheets/`

---

## 1. Current Test Coverage Summary

### Backend / Feature Layer (`src/features/log-sheets/`)

| File                                  | Lines | Coverage    | Notes                                                 |
| ------------------------------------- | ----- | ----------- | ----------------------------------------------------- |
| `log-sheet-locking.ts`                | 40    | **100%** ✅ | Pure function, fully tested                           |
| `log-sheet-status.ts`                 | 55    | **100%** ✅ | State machine, fully tested                           |
| `validation.ts`                       | 222   | **~80%**    | `validateLogSheetEntries` + internal functions tested |
| `approval-validation.ts`              | 200   | **~90%** ✅ | All functions characterized                           |
| `utils.ts`                            | 38    | **100%** ✅ | `makeEntryKey`, `isLogSheetEntryEmpty` fully tested   |
| `types.ts`                            | 203   | **~95%** ✅ | All Zod schemas tested                                |
| `service.ts`                          | 1009  | **~60%**    | Core functions characterized with mocks               |
| `actions.ts`                          | 591   | **~70%**    | All server actions characterized                      |
| `option-a/unit-view-model-builder.ts` | -     | **100%** ✅ | Fully tested                                          |
| `option-a/mobile-view-adapter.ts`     | -     | **~80%**    | Tested via builder tests                              |
| `components/signature-section.tsx`    | -     | **0%** ❌   | No tests                                              |
| `components/signature-pad.tsx`        | -     | **0%** ❌   | No tests                                              |
| `components/log-sheet-preview.tsx`    | -     | **0%** ❌   | No tests                                              |
| `components/log-sheet-header.tsx`     | -     | **0%** ❌   | No tests                                              |

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

| Layer                     | Before Update | After Update |
| ------------------------- | ------------- | ------------ |
| Backend (service/actions) | **~5%**       | **~65%**     |
| Backend (pure functions)  | **~70%**      | **~95%**     |
| Frontend Hooks            | **~50%**      | **~50%**     |
| Frontend Components       | **~5%**       | **~5%**      |
| **OVERALL**               | **~25-30%**   | **~55-60%**  |

---

## 2. New Characterization Tests Added

### Test Files Created (2026-02-21)

| Test File                                                | Lines | Target                   | Tests | Type             |
| -------------------------------------------------------- | ----- | ------------------------ | ----- | ---------------- |
| `__tests__/utils.characterization.test.ts`               | ~140  | `utils.ts`               | 33    | Characterization |
| `__tests__/types.characterization.test.ts`               | ~280  | `types.ts`               | 64    | Characterization |
| `__tests__/service.characterization.test.ts`             | ~600  | `service.ts`             | 50    | Characterization |
| `__tests__/actions.characterization.test.ts`             | ~450  | `actions.ts`             | 36    | Characterization |
| `__tests__/approval-validation.characterization.test.ts` | ~550  | `approval-validation.ts` | 21    | Characterization |

**New test lines added: ~2,020**  
**Total tests added: 204**

---

## 3. Documented Surprising/Buggy Behaviors

### `service.ts`

1. **`isEntryComplete` (line 32-48)**: Returns `true` for `NaN` numeric values - considers any non-null number as complete
2. **`upsertLogSheetChemicalUsages` (line 973)**: Silently skips entries with `amount <= 0` - no error thrown
3. **`getLogSheetDetail` (line 637-640)**: Falls back to ALL machines when `activeMachines` is empty
4. **Range validation** (approval): Silently skips validation when parameter not found in lookup

### `actions.ts`

1. **`updateLogSheetAction` (line 163-165)**: Explicitly sets `status: undefined` - status changes via this action are IGNORED
2. **`saveLogSheetEntriesAction` (line 309-315)**: Checks `isLogSheetEntryEmpty` BEFORE Zod validation - empty entries bypass schema
3. **`saveLogSheetSignatureAction` (line 469-474)**: Uses regex `data:image/(png|jpeg|jpg|webp);base64,` - strict format check
4. **Error handling**: Logs all errors with `[CPIS-ERROR]` prefix, returns generic "Gagal" message for non-Error throws

### `validation.ts`

1. **`isEmpty` (line 51)**: TEXT entries are NEVER considered empty - returns `false` before checking text content
2. **`collectRawWaterMissing` (line 171)**: Excludes parameters with "cycle" in variableName from RAW_WATER requirements

### `approval-validation.ts`

1. **`collectCoolingWaterRequiredErrors`**: REQUIRES RAW_WATER for ALL cooling water params including "cycle of concentration"
   - NOTE: This differs from `validation.ts` behavior which excludes "cycle"
2. **`collectCategoryRequiredErrors`**: JOB_DESCRIPTION requires both VALUE entry per machine AND NOTE entry
3. **`collectApprovalRangeErrors`**: Uses RAW_WATER min/max limits when `entry.role === 'RAW_WATER'`

### `utils.ts`

1. **`isLogSheetEntryEmpty` (line 18)**: Returns `false` immediately if `fileUrl` exists - ignores other value fields
2. **`isLogSheetEntryEmpty` (line 21-22)**: NaN is NOT considered empty for NUMBER type

### `types.ts` (Zod Schemas)

1. **`CreateLogSheetEntrySchema.superRefine`**: NaN numeric values are REJECTED by Zod validation
2. **Date coercion**: `z.coerce.date()` creates new Date instances even when Date object passed

---

## 4. Critical Paths Now Tested

### Previously Untested - Now Characterized

| Path                                   | File                     | Status    |
| -------------------------------------- | ------------------------ | --------- |
| `createLogSheet`                       | `service.ts`             | ✅ Tested |
| `updateLogSheet`                       | `service.ts`             | ✅ Tested |
| `updateLogSheetStatus`                 | `service.ts`             | ✅ Tested |
| `deleteLogSheet`                       | `service.ts`             | ✅ Tested |
| `getLogSheetDetail`                    | `service.ts`             | ✅ Tested |
| `getLogSheetsByProject`                | `service.ts`             | ✅ Tested |
| `getAllLogSheets`                      | `service.ts`             | ✅ Tested |
| `getLogSheetActiveMachines`            | `service.ts`             | ✅ Tested |
| `upsertLogSheetMachines`               | `service.ts`             | ✅ Tested |
| `getLogSheetProjectId`                 | `service.ts`             | ✅ Tested |
| `assertCanCreateLogSheet`              | `service.ts`             | ✅ Tested |
| `saveLogSheetSignature`                | `service.ts`             | ✅ Tested |
| `validateLogSheetForSubmission`        | `service.ts`             | ✅ Tested |
| `validateLogSheetForApproval`          | `service.ts`             | ✅ Tested |
| `upsertLogSheetEntries`                | `service.ts`             | ✅ Tested |
| `upsertLogSheetPhotos`                 | `service.ts`             | ✅ Tested |
| `upsertLogSheetChemicalUsages`         | `service.ts`             | ✅ Tested |
| All server actions                     | `actions.ts`             | ✅ Tested |
| `validateLogSheetApprovalDetail`       | `approval-validation.ts` | ✅ Tested |
| All Zod schemas                        | `types.ts`               | ✅ Tested |
| `makeEntryKey`, `isLogSheetEntryEmpty` | `utils.ts`               | ✅ Tested |

---

## 5. Existing Test Files (Complete List)

| Test File                                                                | Lines | Target                                        | Type             |
| ------------------------------------------------------------------------ | ----- | --------------------------------------------- | ---------------- |
| `service.test.ts`                                                        | 246   | `approval-validation.ts`                      | Unit             |
| `log-sheet-locking.test.ts`                                              | 122   | `log-sheet-locking.ts`, `log-sheet-status.ts` | Unit             |
| `__tests__/validation.characterization.test.ts`                          | 266   | `validation.ts`                               | Characterization |
| `__tests__/utils.characterization.test.ts`                               | ~140  | `utils.ts`                                    | Characterization |
| `__tests__/types.characterization.test.ts`                               | ~280  | `types.ts`                                    | Characterization |
| `__tests__/service.characterization.test.ts`                             | ~600  | `service.ts`                                  | Characterization |
| `__tests__/actions.characterization.test.ts`                             | ~450  | `actions.ts`                                  | Characterization |
| `__tests__/approval-validation.characterization.test.ts`                 | ~550  | `approval-validation.ts`                      | Characterization |
| `option-a/unit-view-model-builder.test.ts`                               | 147   | `option-a/unit-view-model-builder.ts`         | Unit             |
| `hooks/__tests__/use-log-sheet-active-machines.characterization.test.ts` | 488   | `use-log-sheet-active-machines.ts`            | Characterization |
| `hooks/__tests__/use-log-sheet-derived.characterization.test.ts`         | 608   | `use-log-sheet-derived.ts`                    | Characterization |
| `hooks/__tests__/use-log-sheet-draft-state.characterization.test.ts`     | 464   | `use-log-sheet-draft-state.ts`                | Characterization |
| `hooks/__tests__/use-log-sheet-validation.characterization.test.ts`      | 420   | `use-log-sheet-validation.ts`                 | Characterization |
| `hooks/use-mobile-unit-view-model.test.ts`                               | 243   | `use-mobile-unit-view-model.ts`               | Unit             |
| `__tests__/page.characterization.test.tsx`                               | 366   | `page.tsx`                                    | Characterization |

**Total test lines: ~5,500** (was ~3,477)

---

## 6. Remaining Work

### Still Untested

| Priority | Area                                       | Reason                       |
| -------- | ------------------------------------------ | ---------------------------- |
| MEDIUM   | `use-log-sheet-draft-saver.ts`             | Frontend save orchestration  |
| MEDIUM   | `use-log-sheet-detail-data.ts`             | Data fetching hook           |
| LOW      | UI Components                              | React Testing Library needed |
| LOW      | `__tests__/page.characterization.test.tsx` | More edge cases needed       |

### Recommended Next Steps

1. **Convert characterization tests to unit tests** with explicit assertions
2. **Add integration tests** for full DRAFT → SUBMITTED → APPROVED flow
3. **Test error recovery** in `use-log-sheet-draft-saver.ts`
4. **Add component tests** for signature-related components

---

## 7. Test Strategy Notes

### Mocking Strategy Used

```typescript
// Prisma mock pattern (used in service.characterization.test.ts)
vi.mock('@/lib/prisma', () => ({
  prisma: {
    logSheet: { findFirst: vi.fn(), update: vi.fn(), create: vi.fn() },
    logSheetEntry: { findMany: vi.fn(), update: vi.fn(), create: vi.fn() },
    // ... other models
  },
}));

// Service mock pattern (used in actions.characterization.test.ts)
vi.mock('@/features/log-sheets/service', () => ({
  getLogSheetsByProject: vi.fn(),
  createLogSheet: vi.fn(),
  // ... other functions
}));
```

### Coverage Targets

| Layer             | Before | After | Target |
| ----------------- | ------ | ----- | ------ |
| Service functions | 0%     | ~60%  | 80%    |
| Server actions    | 0%     | ~70%  | 60%    |
| Frontend hooks    | 50%    | 50%   | 80%    |
| Pure functions    | 70%    | ~95%  | 95%    |
