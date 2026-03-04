---
description: Execute a CPIS refactoring phase with strict safety protocols and SSOT templates.
---

# /cpis-refactor Workflow

This workflow automates the CPIS Refactoring Roadmap for a specific module and phase.

## Prerequisites

- The target module must exist in `docs/refactoring/modules/[module-name]/` (or will be created).
- The user must specify the module and phase (e.g., `/cpis-refactor m-04 phase-1`).

## Important: Workflow vs Prompt Chaining

> **Phase 2 (Characterize), Phase 4 (Plan), and Phase 5 (Execute) are better done via prompt chaining** because they require iteration, judgment, and creative decisions that a single workflow step cannot capture. Use this workflow for Phase 1, 3, and 6.

## Workflow Steps

1. **Verify Request**
   - Check which phase the user requested (1-6).
   - Identify the target module (e.g., `m-04-users`).

2. **Read Roadmap & Tracker**
   - Read `docs/refactoring/REFACTORING_ROADMAP.md` to understand the rules, sub-steps, and DoD for the requested phase.
   - Read `docs/refactoring/PROGRESS_TRACKER.md` to check the current status of the module.

3. **Load the Template**
   - Based on the requested phase, read the corresponding template from `docs/refactoring/templates/`.
   - Read the explicit AI Prompt instructions embedded as markdown comments at the top of the template.

4. **Execute the Phase**
   - **Phase 1 (Baseline):** Analyze the module's code and fill out `BASELINE_INVENTORY.md`.
   - **Phase 2 (Characterize) — 3 sub-steps:**
     - **2a:** Write characterization tests that capture current behavior (unit-level).
     - **2b:** Identify Critical User Journeys and write E2E test scenarios.
     - **2c:** Measure test coverage. If below threshold (75% critical, 60% high-risk), write more tests and iterate until thresholds are met.
     - Fill out `CHARACTERIZATION_FINDINGS.md`.
   - **Phase 3 (Map):** Analyze dependencies. Document cross-module imports. Fill out `DEPENDENCY_MAP.md`.
   - **Phase 4 (Plan):** Create priority matrix and refactoring plan with file-level work items. Fill out `RISK_MATRIX.md` and `REFACTORING_PLAN.md`. Wait for approval.
   - **Phase 5 (Execute) — 3 sub-steps:**
     - **5a:** Micro-Refactoring Loop per file (1 smell → 1 plan → 1 execute → test → repeat). Low Risk to High Risk.
     - **5b:** Extract Abstractions — kill cross-file duplication, one usage site at a time.
     - **5c:** Layer/DI Cleanup — decouple tight coupling, separate layers if tangled.
   - **Phase 6 (Verify) — 4 sub-steps:**
     - **6a:** Run full test suite (unit + characterization + E2E). If ANY fail → STOP.
     - **6b:** Update SSOT docs: re-fill "After" columns in `BASELINE_INVENTORY.md`, regenerate `DEPENDENCY_MAP.md`, update `RISK_MATRIX.md`.
     - **6c:** Architecture conformance check against CPIS patterns.
     - **6d:** Generate Safety Report and fill `MODULE_README.md` + `TEST_COVERAGE_ANALYSIS.md`.

5. **Check Definition of Done**
   - Before saving outputs, verify all DoD items from `REFACTORING_ROADMAP.md` for the current phase are met.
   - If any DoD item is NOT met, do NOT mark the phase as complete.

6. **Save Outputs**
   - Save the filled-out template(s) to `docs/refactoring/modules/[module-name]/[TEMPLATE_NAME]`. Create the directory if it doesn't exist.
   - **HARD GATE:** All templates for the current phase MUST be filled before proceeding.

7. **Update Progress Tracker**
   - Only after DoD is met and all templates are saved → update `docs/refactoring/PROGRESS_TRACKER.md` to reflect the new status (`[B]`, `[C]`, `[R]`, or `[V]`).

8. **Report to User**
   - Provide a concise summary of findings, linking to the newly generated markdown files in the module's directory.
