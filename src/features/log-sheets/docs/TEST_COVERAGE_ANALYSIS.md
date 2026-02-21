# Test Coverage Analysis - Log Sheets Module (Fullstack)

**Generated:** 2026-02-21  
**Updated:** 2026-02-21 (Frontend Characterization Tests Added)  
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

| File                                                              | Lines | Coverage    | Notes                                      |
| ----------------------------------------------------------------- | ----- | ----------- | ------------------------------------------ |
| `page.tsx` (root)                                                 | 63    | **0%** ❌   | Project list page - component test issue   |
| `[projectId]/page.tsx`                                            | 125   | **0%** ❌   | Log sheet list page - component test issue |
| `[projectId]/[logSheetId]/page.tsx`                               | ~1300 | **~30%**    | Characterization tests for UI flow         |
| `[projectId]/[logSheetId]/utils.ts`                               | 47    | **~90%** ✅ | formatDate, formatLimit, isOutOfRange      |
| `[projectId]/[logSheetId]/types.ts`                               | -     | **0%**      | Type definitions only                      |
| `[projectId]/[logSheetId]/hooks/use-log-sheet-active-machines.ts` | 110   | **~80%** ✅ | Toggle, select all, clear tested           |
| `[projectId]/[logSheetId]/hooks/use-log-sheet-derived.ts`         | 108   | **~90%** ✅ | Categories, params, machines derived       |
| `[projectId]/[logSheetId]/hooks/use-log-sheet-draft-state.ts`     | 93    | **~85%** ✅ | State initialization tested                |
| `[projectId]/[logSheetId]/hooks/use-log-sheet-validation.ts`      | 80    | **~70%**    | Wrapper around validation.ts               |
| `[projectId]/[logSheetId]/hooks/use-log-sheet-draft-saver.ts`     | 156   | **~85%** ✅ | Save flow, error handling tested           |
| `[projectId]/[logSheetId]/hooks/use-log-sheet-detail-data.ts`     | 35    | **~90%** ✅ | Data fetching, reload, error states        |
| `[projectId]/[logSheetId]/hooks/use-log-sheet-technicians.ts`     | 40    | **~90%** ✅ | Technician loading, error handling         |
| `[projectId]/[logSheetId]/hooks/use-mobile-unit-view-model.ts`    | -     | **~80%** ✅ | Mobile adapter tested                      |
| `[projectId]/components/columns.tsx`                              | 68    | **~80%** ✅ | Column definitions tested                  |
| `[projectId]/components/log-sheet-form.tsx`                       | 186   | **0%** ❌   | Form component - needs RTL setup           |
| `[projectId]/components/log-sheet-dialog.tsx`                     | 35    | **0%** ❌   | Dialog wrapper                             |
| `[projectId]/[logSheetId]/components/chemical-usage-section.tsx`  | 211   | **0%** ❌   | Chemical input - needs RTL setup           |
| `[projectId]/[logSheetId]/components/mobile-entry-card.tsx`       | 201   | **0%** ❌   | Mobile card - needs RTL setup              |
| `components/project-columns.tsx`                                  | 29    | **~80%** ✅ | Project list columns tested                |

### Overall Estimate

| Layer                     | Before This Update | After This Update |
| ------------------------- | ------------------ | ----------------- |
| Backend (service/actions) | **~65%**           | **~65%**          |
| Backend (pure functions)  | **~95%**           | **~95%**          |
| Frontend Hooks            | **~50%**           | **~85%**          |
| Frontend Components       | **~5%**            | **~15%**          |
| **OVERALL**               | **~55-60%**        | **~65-70%**       |

---

## 2. New Characterization Tests Added (This Update)

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

### Still Untested

| Priority | Area                         | Reason                                 |
| -------- | ---------------------------- | -------------------------------------- |
| HIGH     | `page.tsx` (root)            | Component test setup issues with mocks |
| HIGH     | `[projectId]/page.tsx`       | Component test setup issues with mocks |
| MEDIUM   | `log-sheet-form.tsx`         | Complex form with react-hook-form      |
| MEDIUM   | `chemical-usage-section.tsx` | Complex component with async state     |
| MEDIUM   | `mobile-entry-card.tsx`      | Complex component with multiple inputs |
| LOW      | `signature-section.tsx`      | Needs canvas/WebRTC mocking            |
| LOW      | `signature-pad.tsx`          | Needs canvas/WebRTC mocking            |
| LOW      | `log-sheet-preview.tsx`      | Print-focused component                |
| LOW      | `log-sheet-header.tsx`       | Display component                      |

### Recommended Next Steps

1. **Fix component test setup** - Investigate why `vi.mock` isn't properly hoisting for page components
2. **Add integration tests** for full DRAFT → SUBMITTED → APPROVED flow
3. **Test error recovery** in form components
4. **Add component tests** for signature-related components (will need canvas mocking)

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

| Layer               | Before | After | Target |
| ------------------- | ------ | ----- | ------ |
| Service functions   | ~60%   | ~60%  | 80%    |
| Server actions      | ~70%   | ~70%  | 60%    |
| Frontend hooks      | ~50%   | ~85%  | 80%    |
| Pure functions      | ~95%   | ~95%  | 95%    |
| Frontend components | ~5%    | ~15%  | 60%    |
