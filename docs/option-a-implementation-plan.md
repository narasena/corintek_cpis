Option A Implementation Plan (Unit → Category → Parameter)

## Prerequisites: REFACTORING COMPLETE ✅

The 5-phase refactoring plan has been completed:

| Phase | Description                 | Status |
| ----- | --------------------------- | ------ |
| 1     | Extract Entry State Context | ✅     |
| 2     | Value Type Abstraction      | ✅     |
| 3     | Decompose God Components    | ✅     |
| 4     | Fix Type Safety             | ✅     |
| 5     | Consolidate Data Fetching   | ✅     |

### Key Changes

- `page.tsx`: 1,245 → 437 lines (**-65%**)
- `service.ts`: 1,008 → 687 lines (**-32%**)
- `log-sheet-category-section.tsx`: 731 → 116 lines (**-84%**)
- Tests: 652 → 813 (**+161**)
- Zero new dependencies

---

## Implementation Progress

### 6.2. View Model Layer ✅ COMPLETE

| Task                     | Status | File/Component                                        |
| ------------------------ | ------ | ----------------------------------------------------- |
| Define contracts (types) | ✅     | `option-a/contracts.ts`                               |
| Unit view model builder  | ✅     | `option-a/unit-view-model-builder.ts`                 |
| Mobile view adapter      | ✅     | `option-a/mobile-view-adapter.ts`                     |
| Null-safety improvements | ✅     | Added `?? []` for all array access                    |
| Unit tests               | ✅     | `option-a/unit-view-model-builder.test.ts` (27 tests) |
| Method analysis doc      | ✅     | `option-a/METHOD_ANALYSIS.md`                         |

### 6.3. UI Components 🚧 IN PROGRESS

| Task                     | Status | File/Component                               |
| ------------------------ | ------ | -------------------------------------------- |
| Feature flag             | ✅     | `option-a/feature-flags.ts`                  |
| Unit overview list       | ✅     | `option-a/components/unit-overview-list.tsx` |
| Unit entry screen        | ✅     | `option-a/components/unit-entry-screen.tsx`  |
| Integration with page    | ⏳     | Pending                                      |
| Navigation between units | ⏳     | Pending                                      |

### 6.4. Draft Persistence and Validation ⏳ PENDING

- Reuse existing draft state and saver hooks
- Validate on save and on submit
- Ensure status-based locking still applies

### 6.5. Integration ⏳ PENDING

- Add routes or internal view switching to use the new screens
- Wire existing actions for save and submit with no backend changes
- Keep legacy detail page intact behind feature flag

---

## Commits (11 total)

```
4fe5962 docs(log-sheets): update METHOD_ANALYSIS with completed improvements
466feca fix(log-sheets): add null-safety and fix test syntax in Option A builder
6e99f03 feat(log-sheets): add feature flag for Option A mobile layout
a6904a4 feat(log-sheets): add mobile unit entry UI components
ddb2c44 feat(log-sheets): complete view model builder for Option A mobile layout
99269a1 docs(log-sheets): update documentation for completed refactoring
f2d9432 test(log-sheets): update tests for refactored architecture
1b2278a refactor(log-sheets): consolidate data fetching in getLogSheetDetail
356d75a refactor(log-sheets): add type-safe Prisma mappers
7a919f1 refactor(log-sheets): decompose god component log-sheet-category-section
28e6c3c refactor(log-sheets): extract entry state context and value type helpers
```

---

1. Goals and Non-Goals

- Goals
  - Reduce mobile CPU/RAM usage by limiting concurrent DOM size and data processing.
  - Match technician workflow: complete one unit at a time.
  - Preserve existing data model and log sheet validation rules.
  - Keep changes isolated and minimal in legacy screens; new logic goes in new files.
- Non-Goals
  - No backend schema changes unless required for UI data grouping.
  - No new heavy UI frameworks or animation libraries.
  - No redesign of approval or signature flows in this phase.

2. User Flow Definition

- Entry: Logsheet Overview
  - Show unit list with completion count per unit.
  - Provide navigation into a unit-specific entry screen.
  - Keep logsheet-level fields (water usage, chemical usage, notes) on this screen.
- Unit Detail: Unit Entry
  - Show only one unit per screen.
  - Sections for categories with parameter rows.
  - Simple inputs with validation feedback.
- Exit: Return to overview
  - Persist draft automatically and show progress indicators.

3. Data Mapping and Contracts

- Identify existing data sources
  - Log sheet detail: parameters, machines, entries, categories.
  - Machine lists for chillers and cooling towers.
  - Existing entry state map and validation hooks.
- Define view model requirements
  - Units list with per-unit completion counts.
  - Category list per unit with parameter order.
  - Parameter row model: label, target range, value type, current value, in-range status.
  - Summary field model: water usage, chemical usage, notes.
- Data grouping rules
  - Unit type determines category list and machine labels.
  - Parameters grouped by category and rendered under the relevant unit type.
  - Logsheet-level parameters remain separate and render only on overview.

4. UI Layout Specification

- Logsheet Overview
  - Header: project name, date, status.
  - Unit list: one row per unit with completion count and status.
  - Summary inputs: water usage, chemical usage, notes.
  - Actions: save draft, submit, print.
- Unit Entry Screen
  - Header: unit name and completion count.
  - Sections: category headings with parameter rows.
  - Parameter row: label, target range, input, in-range indicator.
  - No nested cards; use dividers and spacing only.

5. Performance and Low-End Device Strategy

- Render only the current unit screen, not all units.
- Avoid heavy modal stacks; use simple navigation between screens.
- Limit derived computations with memoized selectors.
- Keep lists short and avoid deep component trees.
- Defer optional UI elements for later.

6. Implementation Steps
   6.1. Discovery and Baseline

- Inventory current log sheet detail screen structure and mobile entry UI components.
- Identify existing hooks for data, draft state, validation, and save flows.
- Confirm which categories are unit-specific vs logsheet-level.

  6.2. View Model Layer

- Create a new view model builder for Option A:
  - Input: log sheet detail data, active machines, entry state.
  - Output: units list, per-unit category groups, parameter rows, summary fields.
- Define type-first contracts:
  - UnitView
  - CategoryView
  - ParameterRowView
  - SummaryFieldView

    6.3. UI Components

- LogsheetOverviewScreen
  - Renders unit list and summary fields.
  - Navigates to UnitEntryScreen.
- UnitEntryScreen
  - Renders sections and parameter rows for a single unit.
  - Uses existing input and validation logic.
- ParameterRow
  - Handles numeric, text, boolean, and file inputs.
  - Displays target range and in-range status.

    6.4. Draft Persistence and Validation

- Reuse existing draft state and saver hooks.
- Validate on save and on submit.
- Ensure status-based locking still applies.

  6.5. Integration

- Add routes or internal view switching to use the new screens.
- Wire existing actions for save and submit with no backend changes.
- Keep legacy detail page intact behind a feature flag if needed.

7. Migration Strategy

- Phase 1: Introduce new screens in parallel behind a toggle.
- Phase 2: Enable for technicians only.
- Phase 3: Remove old mobile layout if stable.

8. Verification Checklist

- Log sheet loads on mobile with acceptable performance.
- All parameters are visible and editable by unit.
- Draft save and reload works across navigation.
- Validation and error states are identical to current behavior.
- Status locking prevents edits when not in DRAFT.

9. Risks and Mitigations

- Risk: wrong parameter grouping per unit
  - Mitigation: map categories using existing machine logic and compare output with current screen.
- Risk: missing summary fields
  - Mitigation: keep logsheet-level fields on overview with existing data bindings.
- Risk: performance regressions
  - Mitigation: limit rendering to one unit screen and reduce nested components.
