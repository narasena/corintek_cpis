# Fix Plan: Resolve 31 Failing Tests

## Root Cause Analysis

After the folder reorganization, tests that were moved from `__tests__/` folders to colocated positions now have incorrect relative import paths. The tests reference:

1. `../page` instead of `./page` (page imports)
2. `../components/...` instead of `./components/...` (component imports)
3. Old paths for moved components like `chemical-usage-section`

## Test Categories

### 1. E2E Tests (8 files) - Skip

These are Playwright tests requiring browser setup. Not related to reorganization.

### 2. Page Characterization Tests (23 failing) - Fix Required

| File                                                                 | Issue                                              | Fix                                 |
| -------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------- |
| `log-sheets/page.characterization.test.tsx`                          | `import('../page')` → should be `import('./page')` | Change line 52                      |
| `log-sheets/[projectId]/page.characterization.test.tsx`              | `import('../page')` → should be `import('./page')` | Change line 70                      |
| `log-sheets/[projectId]/[logSheetId]/page.characterization.test.tsx` | Multiple mock paths broken                         | Fix mock paths for moved components |

## Detailed Fixes

### File 1: `src/app/(main)/log-sheets/page.characterization.test.tsx`

**Line 52:** Change:

```ts
const { default: LogSheetsPage } = await import('../page');
```

To:

```ts
const { default: LogSheetsPage } = await import('./page');
```

### File 2: `src/app/(main)/log-sheets/[projectId]/page.characterization.test.tsx`

**Line 70:** Change:

```ts
const { default: ProjectLogSheetsPage } = await import('../page');
```

To:

```ts
const { default: ProjectLogSheetsPage } = await import('./page');
```

### File 3: `src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.characterization.test.tsx`

Multiple mocks need path updates:

**Line 38-40:** Change:

```ts
vi.mock('../components/chemical-usage-section', () => ({
  ChemicalUsageSection: () => <div data-testid="chemical-usage">Chemicals</div>,
}));
```

To:

```ts
vi.mock('@/features/log-sheets/components/chemical-usage-section', () => ({
  ChemicalUsageSection: () => <div data-testid="chemical-usage">Chemicals</div>,
}));
```

**Line 42-46:** Change:

```ts
vi.mock('../components/mobile-entry-card', () => ({
  MobileEntryCard: () => (
    <div data-testid="mobile-entry-card">Mobile Entry</div>
  ),
}));
```

To:

```ts
vi.mock('./components/mobile-entry-card', () => ({
  MobileEntryCard: () => (
    <div data-testid="mobile-entry-card">Mobile Entry</div>
  ),
}));
```

**Line ~75 (renderPage function):** Change:

```ts
const { default: LogSheetDetailPage } = await import('../page');
```

To:

```ts
const { default: LogSheetDetailPage } = await import('./page');
```

## Additional Mock Paths to Check

The detail page test also needs mocks for:

- `@/features/log-sheets/components/log-sheet-toolbar`
- `@/features/log-sheets/components/machine-selection-panel`
- `@/features/log-sheets/components/log-sheet-category-section`
- `@/features/log-sheets/hooks/use-log-sheet-technicians`

## Execution Order

1. Fix `log-sheets/page.characterization.test.tsx`
2. Fix `log-sheets/[projectId]/page.characterization.test.tsx`
3. Fix `log-sheets/[projectId]/[logSheetId]/page.characterization.test.tsx`
4. Run tests to verify
5. Commit fixes

## Expected Result

All 688 unit/component tests should pass. E2E tests will still require browser setup.
