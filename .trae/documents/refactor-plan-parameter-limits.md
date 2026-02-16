# Refactor Plan — Parameter Limits (Setting Master)

## Slice Definition
- **Outcome:** Single source of truth for applying parameter overrides and formatting limits, without changing behavior.
- **Boundary (Files Touched):**
  - **Add**
    - `src/features/parameters/limits-utils.ts`
    - `src/features/parameters/limits-format.ts`
  - **Update**
    - `src/features/log-sheets/service.ts`
    - `src/features/summary-reports/service.ts`
    - `src/features/log-sheets/components/log-sheet-preview.tsx`
    - `src/app/(main)/log-sheets/[projectId]/[logSheetId]/utils.ts`
    - `src/features/lab-analyses/components/lab-analysis-print.tsx`
- **Invariants (Must Not Change):**
  - API signatures and Prisma schema
  - RBAC behavior
  - UI output and limit formatting behavior

## Current Flow Map
- **Log Sheet Detail**
  - Entry: `src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.tsx`
  - Action: `features/log-sheets/actions.ts`
  - Service: `features/log-sheets/service.ts`
  - Data: `features/log-sheets/types.ts`
- **Summary Reports**
  - Entry: summary report flow
  - Service: `features/summary-reports/service.ts`
- **Lab Analysis Print**
  - Entry: `features/lab-analyses/components/lab-analysis-print.tsx`

## Refactor Steps (Minimal, Safe)
1. **Create helper: apply overrides**
   - New file `limits-utils.ts`
   - Function: `applyProjectOverridesToParameters(parameters, overrides)`
   - Pure, no side effects, no Prisma.
2. **Create helper: format limits**
   - New file `limits-format.ts`
   - Functions: `formatNumericLimit(min, max, unit?)` and `formatRawWaterLimit(min, max, unit?)`
3. **Replace duplicated logic**
   - Swap override merge logic in log-sheets and summary-reports services.
   - Swap limit formatting in log-sheet preview, detail utils, and lab-analysis print.
4. **Manual verification**
   - Log Sheet detail view + print preview
   - Summary Report output (parameter limits)
   - Lab Analysis print table (limits columns)

## Risks
- Formatting output differences (string changes).
- Overrides not applied identically across modules.

## Rollback Plan
- Revert new helper usage in each file.
- Keep helpers in place for future work or remove if unused.

## Stop Conditions
- Output mismatch in any limit display.
- Overrides missing in any module.
