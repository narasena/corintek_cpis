Option A Implementation Plan (Unit → Category → Parameter)

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
