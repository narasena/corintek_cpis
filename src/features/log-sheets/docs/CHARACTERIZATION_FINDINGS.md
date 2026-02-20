# Log-Sheet Module - Characterization Test Findings

> Date: 2026-02-20
> Branch: `test/log-sheets-page-characterization`

This document captures surprising/buggy behavior discovered while writing characterization tests for the `page.tsx` component and its hooks. These behaviors are **not bugs** unless explicitly marked - they are current behavior that should be preserved during refactoring.

---

## 1. useLogSheetDraftState Hook

### 1.1 Auto-initialization of BOOLEAN entries (Surprising Behavior)

**Location:** `use-log-sheet-draft-state.ts:34-65`

**Behavior:** The hook auto-creates `boolValue: false` entries for BOOLEAN parameters in specific categories, even when no entry exists in `detail.entries`.

**Categories affected:**

- `COOLING_WATER_QUALITY` - Creates both VALUE (per CT) and RAW_WATER entries
- `GENERAL_CONDITION` - Creates VALUE entries per active CT
- `JOB_DESCRIPTION` - Creates VALUE entries per active CT

**Implication:** This means BOOLEAN parameters in these categories always have a default `false` value, while other value types (NUMBER, TEXT) remain undefined until explicitly set.

```ts
// Example: BOOLEAN entry is auto-created
entryState['param-bool-1:ct-1:VALUE'] = {
  valueType: 'BOOLEAN',
  boolValue: false,
};
// But NUMBER entry is NOT auto-created
entryState['param-num-1:ct-1:VALUE']; // undefined
```

**Risk if changed:** Validation logic may rely on this auto-initialization. Removing it could break validation that checks for empty entries.

---

### 1.2 Only CT categories get auto-initialized (Design Decision)

**Location:** `use-log-sheet-draft-state.ts:34-38`

**Behavior:** The `ctCategories` set explicitly includes only cooling tower-related categories. Chiller categories (`UNIT_CONDENSOR`, `UNIT_EVAPORATOR`) do NOT get auto-initialized BOOLEAN entries.

```ts
const ctCategories = new Set([
  'COOLING_WATER_QUALITY',
  'GENERAL_CONDITION',
  'JOB_DESCRIPTION',
]);
```

**Implication:** If a BOOLEAN parameter is added to `UNIT_CONDENSOR`, it won't get auto-initialized and could cause validation issues.

---

## 2. useLogSheetValidation Hook

### 2.1 `machinesForCategory` callback in dependency array (Potential Performance Issue)

**Location:** `use-log-sheet-validation.ts:69-76`

**Behavior:** The `machinesForCategory` callback function is included in the `useCallback` dependency array for `validateEntries`.

**Issue:** If `machinesForCategory` is not memoized by the parent component, `validateEntries` will be recreated on every render, potentially causing unnecessary re-renders in child components that depend on it.

```ts
// The dependency array includes a callback
}, [
  detail,
  entryState,
  activeChillerIds,
  activeCTIds,
  machinesForCategory, // <-- callback function
  parametersByCategory,
]);
```

**Recommendation:** Document that `machinesForCategory` should be a stable reference (useCallback).

---

## 3. useLogSheetActiveMachines Hook

### 3.1 Optimistic update with rollback (Current Behavior)

**Location:** `use-log-sheet-active-machines.ts:28-63`

**Behavior:** When toggling/selecting/clearing machines, the hook:

1. Immediately updates local state (optimistic)
2. Calls server action
3. Reverts state if server action fails

**Implication:** There's a brief window where UI state and server state are out of sync. If the user performs rapid actions, race conditions could occur.

```ts
// Optimistic update
setActiveChillerIds(newIds);

// Server call
const res = await saveLogSheetMachinesAction({...});

// Rollback on failure
if (!res.success) {
  setActiveChillerIds(activeChillerIds); // Reverts to previous
}
```

---

## 4. page.tsx Component

### 4.1 Multiple "Kirim" and "Simpan" buttons (UI Duplication)

**Location:** `page.tsx:296-317` and `page.tsx:1225-1243`

**Behavior:** The page renders two sets of action buttons:

1. Desktop toolbar buttons (lines 278-318)
2. Mobile sticky bar buttons (lines 1225-1243)

**Implication:** Tests querying for buttons by name must handle multiple matches. UI testing tools need to distinguish between mobile and desktop variants.

---

### 4.2 `isLocked` computation depends on `locked` property (Type Error)

**Location:** `page.tsx:147-149`

**Current Code:**

```ts
const isStatusLocked = detail?.logSheet.status !== 'DRAFT';
const isHardLocked = detail?.logSheet.locked ?? false; // <-- 'locked' doesn't exist on type
const isLocked = (isStatusLocked || isHardLocked) && !adminOverride;
```

**Issue:** The `TDetail` type does not include a `locked` property on `logSheet`. This causes a TypeScript error. The property might have been removed from the schema or never existed.

**Type Error:**

```
Property 'locked' does not exist on type '{ id: string; projectId: string; ... }'
```

**Recommendation:** Either:

1. Add `locked?: boolean` to `TDetail.logSheet` type
2. Remove the `isHardLocked` check if the feature was deprecated

---

### 4.3 Print mode switches to preview automatically (User Flow)

**Location:** `page.tsx:172-175`

**Behavior:** Clicking the Print button automatically switches to preview mode before triggering `window.print()`.

```ts
const handlePrint = () => {
  setMode('preview');
  setTimeout(() => window.print(), 0);
};
```

**Implication:** User is forced into preview mode when printing. This is intentional (preview is print-optimized) but could surprise users expecting to print from input mode.

---

## 5. Summary of Findings

| #   | Location        | Finding                                    | Risk Level | Action Needed           |
| --- | --------------- | ------------------------------------------ | ---------- | ----------------------- |
| 1.1 | draft-state     | BOOLEAN auto-init only for CT categories   | Medium     | Document in code        |
| 1.2 | draft-state     | Chiller categories excluded from auto-init | Low        | Consider consistency    |
| 2.1 | validation      | `machinesForCategory` in deps array        | Low        | Add memoization comment |
| 3.1 | active-machines | Optimistic updates with rollback           | Low        | Document behavior       |
| 4.1 | page.tsx        | Duplicate buttons (mobile/desktop)         | Low        | Handle in tests         |
| 4.2 | page.tsx        | `locked` property missing from type        | **High**   | Fix type or remove code |
| 4.3 | page.tsx        | Print auto-switches to preview             | Low        | Document behavior       |

---

## 6. Test Coverage Summary

**Created test files:**

1. `hooks/__tests__/use-log-sheet-draft-state.characterization.test.ts` - 18 tests
2. `hooks/__tests__/use-log-sheet-derived.characterization.test.ts` - 20 tests
3. `hooks/__tests__/use-log-sheet-validation.characterization.test.ts` - 11 tests
4. `hooks/__tests__/use-log-sheet-active-machines.characterization.test.ts` - 14 tests
5. `__tests__/page.characterization.test.tsx` - 12 tests
6. `__tests__/utils.characterization.test.ts` - 13 tests (pre-existing)

**Total:** 88 characterization tests

---

_This document should be updated as new behaviors are discovered during refactoring._
