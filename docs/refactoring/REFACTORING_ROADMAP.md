# CPIS Refactoring Roadmap — Global Dashboard

This document tracks the high-level progress and standards for the CPIS project refactoring (Group A through Group F).

---

## 1. Global Progress Dashboard

| Metric                     | Target |   Current | Progress |
| -------------------------- | -----: | --------: | :------: |
| Modules Refactored         |     20 |         1 |    5%    |
| Total LOC Reduction        | {Est.} | {Current} |    —     |
| Avg. Cyclomatic Complexity |    < 5 | {Current} |    —     |
| Overall Test Coverage      |  > 85% | {Current} |    —     |

---

## 2. Refactoring Protocol & Template Mapping (Mandatory)

Every module must follow this "Research → Strategy → Execution → Verify" sequence.

**Rule for AI Agents:** When executing a phase, you MUST read the corresponding template from `docs/refactoring/templates/` and save the filled output to `docs/refactoring/modules/[module-name]/[TEMPLATE_NAME]`. All templates for the current phase MUST be filled before marking the phase as complete.

> **Workflow vs Prompt Guidance:**
>
> - ✅ **Workflow OK:** Phase 1 (Baseline), Phase 3 (Map), Phase 6 (Verify) — mechanical, data-gathering.
> - 🧠 **Prompt Chaining Recommended:** Phase 2 (Characterize), Phase 4 (Plan), Phase 5 (Execute) — judgment-heavy, iterative, requires creative decisions.

---

### Phase 1: Baseline

Inventory LOC, complexity, and tech debt.

- **Template:** `BASELINE_INVENTORY.md`
- **Mode:** ✅ Workflow OK

---

### Phase 2: Characterize (3 Sub-Steps)

Lock down current behavior before touching any code.

- **Template:** `CHARACTERIZATION_FINDINGS.md`
- **Mode:** 🧠 Prompt Chaining Recommended

**Sub-steps (must be done in order):**

**2a. Characterization Tests (Unit-Level)**
Write tests that capture CURRENT behavior (main path, edge cases, errors). Extract implicit contracts (SDD) for complex logic.

**2b. E2E Tests for Critical Paths**
Identify Critical User Journeys and write end-to-end test scenarios covering: happy path, most common user flow, error recovery paths.

**2c. Coverage Measurement + Iteration Gate**
Measure test coverage. Compare against thresholds. Iterate if below.

| Risk Level        | Minimum Coverage Before Refactoring |
| ----------------- | ----------------------------------: |
| Critical paths    |                                75%+ |
| HIGH risk modules |                                60%+ |
| LOW risk modules  |               Can proceed with less |

**⚠️ GATE:** If coverage is below threshold → write more tests before proceeding to Phase 3. Do NOT skip this step.

**Definition of Done (Phase 2):**

- [ ] Characterization tests exist for all code you plan to refactor
- [ ] E2E tests cover all critical user journeys
- [ ] All tests pass with current (messy) code
- [ ] Test coverage measured, documented, and meets thresholds
- [ ] `CHARACTERIZATION_FINDINGS.md` is filled and saved

---

### Phase 3: Map

Create dependency graphs to find God files and tight coupling.

- **Template:** `DEPENDENCY_MAP.md`
- **Mode:** ✅ Workflow OK
- **Cross-Module Rule:** If the module imports from or is imported by other modules, document the external dependencies in the "Cross-Module Impact" section of `DEPENDENCY_MAP.md`. Flag any changes that will affect code outside the module boundary.

---

### Phase 4: Plan

Strategy with priority matrix (Risk/Value).

- **Template:** `RISK_MATRIX.md` & `REFACTORING_PLAN.md`
- **Mode:** 🧠 Prompt Chaining Recommended
- **Rule:** The `REFACTORING_PLAN.md` must break execution into **file-level work items**, not module-level. This prevents context window overflow in Phase 5.

---

### Phase 5: Execute (3 Sub-Steps)

- **Mode:** 🧠 Prompt Chaining Recommended

**5a. Micro-Refactoring Loop (per file)**

- _Rule:_ Do NOT refactor the whole file at once.
  1. Identify ONE smell. 2. Plan ONE change. 3. Execute & Run Tests. 4. If tests pass, commit. 5. Repeat.
- _Order:_ Always refactor from Lowest Risk to Highest Risk.
- _Scope:_ Work on ONE file or ONE sub-component at a time.

**5b. Extract to Abstractions**
After individual files are cleaner, tackle cross-file duplication:

1. Find duplicated code blocks across the module
2. Design an abstraction (interface, shared utility, base component)
3. Update ONE usage site at a time. Run tests after each.

**5c. Layer/DI Cleanup (if applicable)**
If tight coupling or layer violations exist:

1. Identify direct instantiation, static calls, global state
2. Refactor to use dependency injection, one dependency at a time
3. Separate presentation, business logic, and data layers if tangled

**Definition of Done (Phase 5 — Per Module):**

- [ ] No methods > 30 lines (or clear justification)
- [ ] No duplicate code blocks within the module
- [ ] All magic values replaced with constants
- [ ] Clear separation of concerns
- [ ] All tests pass (characterization + E2E)
- [ ] Changes scoped to module boundary (or cross-module impact documented)

---

### Phase 6: Verify (4 Sub-Steps)

- **Template:** `TEST_COVERAGE_ANALYSIS.md` & `MODULE_README.md`
- **Mode:** ✅ Workflow OK

**6a. Post-Refactor Regression Gate**

1. Run full test suite (unit + characterization + E2E)
2. If ANY test fails → **STOP**. Diagnose root cause. Do NOT proceed.
3. All tests must be green before continuing.

**6b. Update SSOT Documentation**
Stale docs are worse than no docs. The agent MUST:

1. Re-run baseline metrics and fill the "After" column in `BASELINE_INVENTORY.md`
2. Regenerate `DEPENDENCY_MAP.md` if files were moved/split/renamed
3. Update `RISK_MATRIX.md` to reflect reduced risk levels
4. Archive or annotate resolved findings in `CHARACTERIZATION_FINDINGS.md`

**6c. Architecture Conformance Check**
Verify the refactored module follows CPIS architecture:

- Domain components in `features/[domain]/components/`
- Reusable hooks in `features/[domain]/hooks/`
- Server actions in `features/[domain]/actions.ts`
- Business logic in `features/[domain]/service.ts`
- Tests colocated with source (`*.test.ts`)

**6d. Generate Safety Report & Module README**

1. Generate a Safety Report: tests passed/failed, LOC delta, complexity delta
2. Fill out `MODULE_README.md` with: key improvements, before/after metrics, final structure
3. Fill out `TEST_COVERAGE_ANALYSIS.md`

**⚠️ GATE:** Only after ALL sub-steps pass → update `PROGRESS_TRACKER.md`.

---

## 3. Global Coding Standards

- **Naming**: Interfaces prefixed with `I` (e.g. `ILogSheet`), Types with `T` (e.g. `TStatus`).
- **Organization**: Domain components in `features/[domain]/components/`, reusable hooks in `features/[domain]/hooks/`.
- **Testing**: Characterization tests must be colocated with source (`*.test.ts`).
- **No Magic Strings**: Categories and constants must be centralized in `[domain]/constants.ts` or `[domain]/helpers.ts`.

---

## 4. Phase Schedule

| Phase | Description     | Modules      | Status        |
| ----- | --------------- | ------------ | ------------- |
| **A** | Foundation      | M-01 to M-03 | {In Progress} |
| **B** | Master Data     | M-04 to M-07 | {Pending}     |
| **C** | Core Business   | M-08 to M-10 | {Pending}     |
| **D** | Complex Domains | M-11 to M-14 | {M-11 Done}   |
| **E** | Supporting      | M-15 to M-18 | {Pending}     |
| **F** | Cross-Cutting   | M-19 to M-20 | {Pending}     |
