---
description: Execute a CPIS refactoring phase with strict safety protocols and SSOT templates.
---

# /cpis-refactor Workflow

This workflow automates the CPIS Refactoring Roadmap for a specific module and phase.

## Prerequisites

- The target module must exist in `docs/refactoring/modules/[module-name]/` (or will be created).
- The user must specify the module and phase (e.g., `/cpis-refactor m-04 phase-1`).

## Workflow Steps

1. **Verify Request**
   - Check which phase the user requested (1-6).
   - Identify the target module (e.g., `m-04-users`).

2. **Read Roadmap & Tracker**
   - Read `docs/refactoring/REFACTORING_ROADMAP.md` to understand the rules for the requested phase.
   - Read `docs/refactoring/PROGRESS_TRACKER.md` to check the current status of the module.

3. **Load the Template**
   - Based on the requested phase, read the corresponding template from `docs/refactoring/templates/`.
   - Read the explicit AI Prompt instructions embedded as markdown comments at the top of the template.

4. **Execute the Phase**
   - **Phase 1 (Baseline):** Analyze the module's code and fill out `BASELINE_INVENTORY.md`.
   - **Phase 2 (Characterize):** Write characterization tests. Identify critical E2E user journeys. Extract SDD contracts if complex. Fill out `CHARACTERIZATION_FINDINGS.md`.
   - **Phase 3 (Map):** Analyze dependencies. Fill out `DEPENDENCY_MAP.md`.
   - **Phase 4 (Plan):** Create priority matrix and refactoring plan. Fill out `RISK_MATRIX.md` and `REFACTORING_PLAN.md`. Wait for approval.
   - **Phase 5 (Execute):** Run the Micro-Refactoring Loop (1 smell -> 1 plan -> 1 execute -> test -> repeat). Always work Low Risk to High Risk.
   - **Phase 6 (Verify):** Verify all tests pass. Fill out `TEST_COVERAGE_ANALYSIS.md`.

5. **Save Outputs**
   - Save the filled-out template(s) to `docs/refactoring/modules/[module-name]/[TEMPLATE_NAME]`. Create the directory if it doesn't exist.

6. **Update Progress Tracker**
   - Once the phase is complete, update `docs/refactoring/PROGRESS_TRACKER.md` to reflect the new status (`[B]`, `[C]`, `[R]`, or `[V]`).

7. **Report to User**
   - Provide a concise summary of findings, linking to the newly generated markdown files in the module's directory.
