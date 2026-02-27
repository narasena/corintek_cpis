Option C Implementation Plan (Parameter → Unit Group → Machines)

1. Goals and Non-Goals
- Goals
  - Provide a fast, compact input flow per parameter across all machines.
  - Make it easy to compare values across units for the same parameter.
  - Keep the UI lightweight for low-end devices by rendering one parameter at a time.
  - Preserve existing data model and validation rules.
- Non-Goals
  - No backend schema changes unless required to support parameter grouping.
  - No changes to approval or signature flows in this phase.
  - No analytics dashboard beyond the parameter entry flow.

2. User Flow Definition
- Entry: Logsheet Overview
  - Show parameter list grouped by unit group (Chiller, Cooling Tower).
  - Each parameter row shows completion count across machines.
  - Logsheet-level fields (water usage, chemical usage, notes) remain on overview.
- Parameter Entry
  - User selects a parameter (e.g., Temp In).
  - A single screen shows that parameter across all machines.
  - User enters values in a compact list for each machine.
- Exit: Return to overview
  - Persist draft automatically and show progress indicators.

3. Data Mapping and Contracts
- Identify existing data sources
  - Log sheet detail: parameters, machines, entries, categories.
  - Machine lists for chillers and cooling towers.
  - Existing entry state map and validation hooks.
- Define view model requirements
  - Parameter list with category grouping and display order.
  - Machine list per parameter based on unit group.
  - Parameter row model for each machine: label, target range, value type, current value, in-range status.
  - Summary field model: water usage, chemical usage, notes.
- Data grouping rules
  - Parameters grouped by category and by unit group.
  - Machines determined by category mapping and active machine selection.
  - Logsheet-level parameters remain separate and render only on overview.

4. UI Layout Specification
- Logsheet Overview
  - Header: project name, date, status.
  - Parameter list grouped by unit group and category.
  - Each row shows parameter name and completion count across machines.
  - Summary inputs: water usage, chemical usage, notes.
  - Actions: save draft, submit, print.
- Parameter Entry Screen
  - Header: parameter name, unit group, target range.
  - Machine list: one row per machine with input field and in-range indicator.
  - Minimal UI: no nested cards, no modals.

5. Performance and Low-End Device Strategy
- Render only one parameter screen at a time.
- Avoid modal stacks and animated transitions.
- Use memoized selectors for parameter lists and machine lists.
- Keep row components shallow and consistent.
- Avoid heavy visual styling or large icons.

6. Implementation Steps
6.1. Discovery and Baseline
- Inventory current log sheet detail screen structure and mobile entry UI components.
- Identify existing hooks for data, draft state, validation, and save flows.
- Confirm category-to-unit-group mapping rules.

6.2. View Model Layer
- Create a new view model builder for Option C:
  - Input: log sheet detail data, active machines, entry state.
  - Output: parameter list by unit group, per-parameter machine rows, summary fields.
- Define type-first contracts:
  - UnitGroupView
  - ParameterListView
  - MachineRowView
  - SummaryFieldView

6.3. UI Components
- LogsheetOverviewScreen
  - Renders grouped parameter list and summary fields.
  - Navigates to ParameterEntryScreen.
- ParameterEntryScreen
  - Renders machine rows for the selected parameter.
  - Uses existing input and validation logic.
- MachineRow
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
- Phase 3: Keep as optional view for supervisors if desired.

8. Verification Checklist
- Log sheet loads on mobile with acceptable performance.
- All parameters are visible and editable by parameter group.
- Draft save and reload works across navigation.
- Validation and error states are identical to current behavior.
- Status locking prevents edits when not in DRAFT.

9. Risks and Mitigations
- Risk: parameter-first flow feels unnatural for technicians
  - Mitigation: limit to supervisor view or provide unit-first as default.
- Risk: wrong machine list per parameter
  - Mitigation: reuse existing category-to-machine mapping logic and compare to current screen.
- Risk: missing summary fields
  - Mitigation: keep logsheet-level fields on overview with existing data bindings.
