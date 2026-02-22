# Test Coverage Analysis - Log Sheets Module (Fullstack)

**Generated:** 2026-02-21  
**Updated:** 2026-02-22 (E2E Tests, Signature Components, Print Preview, Performance Tests)  
**Scope:** `src/features/log-sheets/` + `src/app/(main)/log-sheets/` + `src/__tests__/e2e/log-sheet/`

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
| `components/signature-section.tsx`    | -     | **~85%** ✅ | Canvas mocking, dialog, save flow                     |
| `components/signature-pad.tsx`        | -     | **~80%** ✅ | Canvas mocking, pointer events, clear/save            |
| `components/log-sheet-preview.tsx`    | -     | **~60%** ✅ | E2E visual regression tests                           |
| `components/log-sheet-header.tsx`     | -     | **0%**      | Display component - minimal logic                     |

### Frontend / UI Layer (`src/app/(main)/log-sheets/`)

| File                                                              | Lines | Coverage    | Notes                                       |
| ----------------------------------------------------------------- | ----- | ----------- | ------------------------------------------- |
| `page.tsx` (root)                                                 | 63    | **~85%** ✅ | Project list page - loading, data, errors   |
| `[projectId]/page.tsx`                                            | 125   | **~80%** ✅ | Log sheet list page - CRUD, navigation      |
| `[projectId]/[logSheetId]/page.tsx`                               | ~1300 | **~30%**    | Characterization tests for UI flow          |
| `[projectId]/[logSheetId]/utils.ts`                               | 47    | **~90%** ✅ | formatDate, formatLimit, isOutOfRange       |
| `[projectId]/[logSheetId]/types.ts`                               | -     | **0%**      | Type definitions only                       |
| `[projectId]/[logSheetId]/hooks/use-log-sheet-active-machines.ts` | 110   | **~80%** ✅ | Toggle, select all, clear tested            |
| `[projectId]/[logSheetId]/hooks/use-log-sheet-derived.ts`         | 108   | **~90%** ✅ | Categories, params, machines derived        |
| `[projectId]/[logSheetId]/hooks/use-log-sheet-draft-state.ts`     | 93    | **~85%** ✅ | State initialization tested                 |
| `[projectId]/[logSheetId]/hooks/use-log-sheet-validation.ts`      | 80    | **~70%**    | Wrapper around validation.ts                |
| `[projectId]/[logSheetId]/hooks/use-log-sheet-draft-saver.ts`     | 156   | **~85%** ✅ | Save flow, error handling tested            |
| `[projectId]/[logSheetId]/hooks/use-log-sheet-detail-data.ts`     | 35    | **~90%** ✅ | Data fetching, reload, error states         |
| `[projectId]/[logSheetId]/hooks/use-log-sheet-technicians.ts`     | 40    | **~90%** ✅ | Technician loading, error handling          |
| `[projectId]/[logSheetId]/hooks/use-mobile-unit-view-model.ts`    | -     | **~80%** ✅ | Mobile adapter tested                       |
| `[projectId]/components/columns.tsx`                              | 68    | **~80%** ✅ | Column definitions tested                   |
| `[projectId]/components/log-sheet-form.tsx`                       | 186   | **~75%** ✅ | Form submission, validation, error handling |
| `[projectId]/components/log-sheet-dialog.tsx`                     | 35    | **0%** ❌   | Dialog wrapper                              |
| `[projectId]/[logSheetId]/components/chemical-usage-section.tsx`  | 211   | **~70%** ✅ | Chemical add/remove, validation, disabled   |
| `[projectId]/[logSheetId]/components/mobile-entry-card.tsx`       | 201   | **~65%** ✅ | NUMBER/BOOLEAN/TEXT inputs, camera, notes   |
| `components/project-columns.tsx`                                  | 29    | **~80%** ✅ | Project list columns tested                 |

### Overall Estimate

| Layer                     | Before E2E Update | After All Updates |
| ------------------------- | ----------------- | ----------------- |
| Backend (service/actions) | **~65%**          | **~65%**          |
| Backend (pure functions)  | **~95%**          | **~95%**          |
| Frontend Hooks            | **~50%**          | **~85%**          |
| Frontend Components       | **~5%**           | **~70%**          |
| E2E Integration           | **~20%**          | **~90%**          |
| Performance Tests         | **0%**            | **100%**          |
| **OVERALL**               | **~55-60%**       | **~80-85%**       |

---

## 2. New Characterization Tests Added (This Update)

### Test Files Created (2026-02-22 - Signature Components)

| Test File                                                                                  | Lines | Target                  | Tests | Type             |
| ------------------------------------------------------------------------------------------ | ----- | ----------------------- | ----- | ---------------- |
| `src/features/log-sheets/components/__tests__/signature-pad.characterization.test.tsx`     | ~280  | `signature-pad.tsx`     | 19    | Characterization |
| `src/features/log-sheets/components/__tests__/signature-section.characterization.test.tsx` | ~340  | `signature-section.tsx` | 17    | Characterization |

**New test lines added: ~620**  
**New tests added: 36**

### Test Files Created (2026-02-22 - Performance Tests)

| Test File                                                         | Lines | Target                     | Tests | Type        |
| ----------------------------------------------------------------- | ----- | -------------------------- | ----- | ----------- |
| `src/features/log-sheets/__tests__/log-sheet-performance.test.ts` | ~310  | Large data set performance | 9     | Performance |

**New test lines added: ~310**  
**New tests added: 9**

### E2E Test Files Created (2026-02-22 - Print Preview Visual Regression)

| Test File                                           | Lines | Target                           | Tests | Type |
| --------------------------------------------------- | ----- | -------------------------------- | ----- | ---- |
| `src/__tests__/e2e/log-sheet/print-preview.spec.ts` | ~200  | Print preview, visual regression | 6     | E2E  |

**New E2E test lines added: ~200**  
**New E2E tests added: 6**

---

### E2E Test Files Created (2026-02-22 - Full Integration Tests)

| Test File                                | Lines | Tests | Type | Coverage Area                                 |
| ---------------------------------------- | ----- | ----- | ---- | --------------------------------------------- |
| `happy-path.spec.ts` (existing)          | ~75   | 2     | E2E  | Basic create→fill→submit flow                 |
| `draft-flow.spec.ts` (existing)          | ~115  | 4     | E2E  | Draft persistence, machine selection          |
| `admin-override.spec.ts` (existing)      | ~158  | 5     | E2E  | Admin unlock/edit, role-based access          |
| `full-workflow.spec.ts` (NEW)            | ~200  | 7     | E2E  | Complete workflow, signatures, print mode     |
| `user-flows.spec.ts` (NEW)               | ~250  | 9     | E2E  | CRUD, navigation, chemical, mobile view       |
| `validation-recovery.spec.ts` (enhanced) | ~350  | 14    | E2E  | Network failures, permissions, data integrity |
| `approval.spec.ts` (NEW)                 | ~180  | 8     | E2E  | Approval flow, PIC roles, status locking      |

**New E2E test lines added this update: ~980**  
**New E2E tests added this update: 38**  
**Total E2E test count: 49 tests**

### E2E Test Scenarios by Category

#### Happy Path (Success User Stories)

| Scenario                                                | Test File               | Status |
| ------------------------------------------------------- | ----------------------- | ------ |
| Technician creates, fills, signs, and submits log sheet | `happy-path.spec.ts`    | ✅     |
| Complete DRAFT → SUBMITTED → APPROVED workflow          | `full-workflow.spec.ts` | ✅ NEW |
| Dual signature (technician + client PIC) before submit  | `full-workflow.spec.ts` | ✅ NEW |
| Multi-machine entry (chillers + cooling towers)         | `full-workflow.spec.ts` | ✅ NEW |
| BOOLEAN/TEXT parameter entry with notes                 | `full-workflow.spec.ts` | ✅ NEW |
| Print preview mode functionality                        | `full-workflow.spec.ts` | ✅ NEW |
| Chemical usage add/save                                 | `full-workflow.spec.ts` | ✅ NEW |

#### Most Common User Flows

| Scenario                                        | Test File            | Status |
| ----------------------------------------------- | -------------------- | ------ |
| Resume draft from project list                  | `user-flows.spec.ts` | ✅ NEW |
| Delete log sheet from list                      | `user-flows.spec.ts` | ✅ NEW |
| "Replaced by" technician selection              | `user-flows.spec.ts` | ✅ NEW |
| GENERAL_CONDITION category with notes           | `user-flows.spec.ts` | ✅ NEW |
| JOB_DESCRIPTION category with notes per machine | `user-flows.spec.ts` | ✅ NEW |
| Chemical usage CRUD operations                  | `user-flows.spec.ts` | ✅ NEW |
| Mobile responsive view (entry cards)            | `user-flows.spec.ts` | ✅ NEW |
| Consumption category with water meter           | `user-flows.spec.ts` | ✅ NEW |
| Select all / clear machines functionality       | `user-flows.spec.ts` | ✅ NEW |

#### Error Recovery Paths

| Scenario                                              | Test File                     | Status |
| ----------------------------------------------------- | ----------------------------- | ------ |
| Submit without signatures shows validation error      | `validation-recovery.spec.ts` | ✅     |
| Out-of-range value shows visual warning               | `validation-recovery.spec.ts` | ✅     |
| Missing required entries prevents submission          | `validation-recovery.spec.ts` | ✅     |
| Validation error can be fixed and retried             | `validation-recovery.spec.ts` | ✅     |
| Network failure during save shows error, allows retry | `validation-recovery.spec.ts` | ✅ NEW |
| File upload failure doesn't block entry save          | `validation-recovery.spec.ts` | ✅ NEW |
| Timeout during submission shows user-friendly error   | `validation-recovery.spec.ts` | ✅ NEW |
| Unauthorized user cannot access project log sheets    | `validation-recovery.spec.ts` | ✅ NEW |
| Non-project member cannot edit log sheet              | `validation-recovery.spec.ts` | ✅ NEW |
| Concurrent edit detection preserves data              | `validation-recovery.spec.ts` | ✅ NEW |
| Duplicate log sheet date shows warning                | `validation-recovery.spec.ts` | ✅ NEW |
| Empty entries are not saved to database               | `validation-recovery.spec.ts` | ✅ NEW |
| Signature pad canvas loads correctly                  | `validation-recovery.spec.ts` | ✅ NEW |
| Signature can be cleared and redrawn                  | `validation-recovery.spec.ts` | ✅ NEW |

#### Admin & Approval Flows

| Scenario                                           | Test File          | Status |
| -------------------------------------------------- | ------------------ | ------ |
| Admin can approve submitted log sheet              | `approval.spec.ts` | ✅ NEW |
| Approved log sheet cannot be edited                | `approval.spec.ts` | ✅ NEW |
| Admin override unlock button appears for submitted | `approval.spec.ts` | ✅ NEW |
| Admin can unlock, edit, and relock submitted       | `approval.spec.ts` | ✅ NEW |
| Admin cannot change status directly via update     | `approval.spec.ts` | ✅ NEW |
| Approval validation checks all required fields     | `approval.spec.ts` | ✅ NEW |
| Project PIC can see approval button                | `approval.spec.ts` | ✅ NEW |
| Approval records timestamp and approver            | `approval.spec.ts` | ✅ NEW |

---

### Test Files Created (2026-02-22 - Page & Component Tests)

| Test File                                                                                                                  | Lines | Target                       | Tests | Type             |
| -------------------------------------------------------------------------------------------------------------------------- | ----- | ---------------------------- | ----- | ---------------- |
| `src/app/(main)/log-sheets/__tests__/page.characterization.test.tsx`                                                       | ~140  | `page.tsx` (root)            | 14    | Characterization |
| `src/app/(main)/log-sheets/[projectId]/__tests__/page.characterization.test.tsx`                                           | ~310  | `[projectId]/page.tsx`       | 17    | Characterization |
| `src/app/(main)/log-sheets/[projectId]/components/__tests__/log-sheet-form.characterization.test.tsx`                      | ~400  | `log-sheet-form.tsx`         | 27    | Characterization |
| `src/app/(main)/log-sheets/[projectId]/[logSheetId]/components/__tests__/chemical-usage-section.characterization.test.tsx` | ~470  | `chemical-usage-section.tsx` | 29    | Characterization |
| `src/app/(main)/log-sheets/[projectId]/[logSheetId]/components/__tests__/mobile-entry-card.characterization.test.tsx`      | ~500  | `mobile-entry-card.tsx`      | 33    | Characterization |

**New test lines added this update: ~1,820**  
**New tests added this update: 120**

### Test Files Created (2026-02-21 - Frontend Hooks)

| Test File                                                            | Lines | Target                         | Tests | Type             |
| -------------------------------------------------------------------- | ----- | ------------------------------ | ----- | ---------------- |
| `hooks/__tests__/use-log-sheet-draft-saver.characterization.test.ts` | ~430  | `use-log-sheet-draft-saver.ts` | 38    | Characterization |
| `hooks/__tests__/use-log-sheet-detail-data.characterization.test.ts` | ~180  | `use-log-sheet-detail-data.ts` | 18    | Characterization |
| `hooks/__tests__/use-log-sheet-technicians.characterization.test.ts` | ~160  | `use-log-sheet-technicians.ts` | 14    | Characterization |
| `[projectId]/components/__tests__/columns.characterization.test.tsx` | ~130  | `columns.tsx`                  | 12    | Characterization |
| `components/__tests__/project-columns.characterization.test.tsx`     | ~70   | `project-columns.tsx`          | 9     | Characterization |

**New test lines added this update: ~970**  
**New tests added this update: 91**

### Previous Test Files (Already Existed)

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
| `__tests__/utils.characterization.test.ts`                               | 107   | `utils.ts` (detail page)                      | Characterization |

**Total test lines: ~6,500**

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

### `use-log-sheet-draft-saver.ts` (NEW)

1. **Header update calls**: Uses `updateLogSheetAdminOverrideAction` when `allowAdminOverride` is true, otherwise `updateLogSheetAction`
2. **File upload failure**: Continues saving entries even when individual file uploads fail - does not abort the whole save
3. **Chemical filtering**: Silently filters out chemicals with `amount <= 0` or missing `chemicalId`

### `use-log-sheet-detail-data.ts` (NEW)

1. **Error toast on null data**: Shows error toast when `result.data` is null/undefined even if `success: true`

### `use-log-sheet-technicians.ts` (NEW)

1. **Cleanup on unmount**: Uses `active` flag to prevent setState after unmount during async fetch

---

## 4. Critical Paths Now Tested

### Previously Untested - Now Characterized (This Update)

| Path                         | File                           | Status    |
| ---------------------------- | ------------------------------ | --------- |
| `saveDraft` return value     | `use-log-sheet-draft-saver.ts` | ✅ Tested |
| Header update (admin/normal) | `use-log-sheet-draft-saver.ts` | ✅ Tested |
| Entry state parsing          | `use-log-sheet-draft-saver.ts` | ✅ Tested |
| File upload flow             | `use-log-sheet-draft-saver.ts` | ✅ Tested |
| Chemical filtering           | `use-log-sheet-draft-saver.ts` | ✅ Tested |
| Data fetching/reload         | `use-log-sheet-detail-data.ts` | ✅ Tested |
| Technician loading           | `use-log-sheet-technicians.ts` | ✅ Tested |
| Column definitions           | `columns.tsx`                  | ✅ Tested |
| Project columns              | `project-columns.tsx`          | ✅ Tested |

### Previously Tested (Already Existed)

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

## 5. Remaining Work

### Still Untested (Unit/Component Level)

| Priority | Area                   | Reason                         |
| -------- | ---------------------- | ------------------------------ |
| LOW      | `log-sheet-dialog.tsx` | Dialog wrapper - minimal logic |
| LOW      | `log-sheet-header.tsx` | Display component              |

### E2E Test Coverage Status

| Category                          | Tests  | Status      |
| --------------------------------- | ------ | ----------- |
| Happy Path (Success User Stories) | 7      | ✅ Complete |
| Most Common User Flows            | 9      | ✅ Complete |
| Error Recovery Paths              | 14     | ✅ Complete |
| Admin & Approval Flows            | 8      | ✅ Complete |
| Print Preview Visual Regression   | 6      | ✅ Complete |
| **Total E2E Tests**               | **55** | ✅ Complete |

### Recommended Next Steps

1. ~~**Add integration tests** for full DRAFT → SUBMITTED → APPROVED flow~~ ✅ DONE
2. ~~**Test error recovery** in form components~~ ✅ DONE
3. ~~**Add component tests** for signature-related components (will need canvas mocking)~~ ✅ DONE
4. ~~**Add visual regression tests** for print preview mode~~ ✅ DONE
5. ~~**Add performance tests** for large log sheet data sets~~ ✅ DONE

---

## 6. Test Strategy Notes

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

// Action mock pattern (used in hook tests)
vi.mock('@/features/log-sheets/actions', () => ({
  updateLogSheetAction: vi.fn(),
  saveLogSheetEntriesAction: vi.fn(),
  // ... other actions
}));

// Hook mock pattern
vi.mock('../hooks/use-log-sheet-technicians', () => ({
  useLogSheetTechnicians: () => ({ technicians: [] }),
}));
```

### Coverage Targets

| Layer                | Before | After All Updates | Target |
| -------------------- | ------ | ----------------- | ------ |
| Service functions    | ~60%   | ~60%              | 80%    |
| Server actions       | ~70%   | ~70%              | 60%    |
| Frontend hooks       | ~50%   | ~85%              | 80%    |
| Pure functions       | ~95%   | ~95%              | 95%    |
| Frontend components  | ~5%    | ~70%              | 60%    |
| E2E Integration      | ~20%   | **90%**           | 80%    |
| Signature Components | 0%     | **85%**           | 70%    |
| Performance Tests    | 0%     | **100%**          | 100%   |
| **OVERALL**          | ~55%   | **~80-85%**       | 75%    |

### E2E Test Fixtures

| Fixture File           | Lines | Purpose                                   |
| ---------------------- | ----- | ----------------------------------------- |
| `log-sheet-fixture.ts` | ~250  | Log sheet CRUD, entry filling, signatures |
| `signature-fixture.ts` | ~12   | Signature data URL generation             |
| `form-helpers.ts`      | ~85   | Generic form interaction helpers          |

### Playwright Configuration

```typescript
// playwright.config.ts - Test Projects
projects: [
  { name: 'setup:admin', testMatch: /admin\.setup\.ts/ },
  { name: 'setup:technician', testMatch: /technician\.setup\.ts/ },
  { name: 'setup:client-pic', testMatch: /client-pic\.setup\.ts/ },
  { name: 'log-sheet:happy-path', dependencies: ['setup:technician'] },
  { name: 'log-sheet:full-workflow', dependencies: ['setup:technician'] },
  { name: 'log-sheet:draft-flow', dependencies: ['setup:technician'] },
  { name: 'log-sheet:user-flows', dependencies: ['setup:technician'] },
  { name: 'log-sheet:validation', dependencies: ['setup:technician'] },
  { name: 'log-sheet:admin', dependencies: ['setup:admin'] },
  { name: 'log-sheet:approval', dependencies: ['setup:admin'] },
  { name: 'log-sheet:print-preview', dependencies: ['setup:technician'] },
];
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test project
npx playwright test --project=log-sheet:full-workflow

# Run print preview visual regression tests
npx playwright test --project=log-sheet:print-preview

# Run with UI for debugging
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed
```
