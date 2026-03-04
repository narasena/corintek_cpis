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

Every module must follow this "Research → Strategy → Execution" sequence.
**Rule for AI Agents:** When executing a phase, you MUST read the corresponding template from `docs/refactoring/templates/` and save the filled output to `docs/refactoring/modules/[module-name]/[TEMPLATE_NAME]`.

1. **Baseline**: Inventory LOC, complexity, and tech debt.
   - **Template:** `BASELINE_INVENTORY.md`
2. **Characterize**: Write Characterization Tests (Golden Tests) and identify E2E Critical Journeys to lock down current behavior. Extract implicit contracts (SDD) if complex.
   - **Template:** `CHARACTERIZATION_FINDINGS.md`
3. **Map**: Create dependency graphs to find God files and tight coupling.
   - **Template:** `DEPENDENCY_MAP.md`
4. **Plan**: Strategy with priority matrix (Risk/Value).
   - **Template:** `RISK_MATRIX.md` & `REFACTORING_PLAN.md`
5. **Execute**: The Micro-Refactoring Loop.
   - _Rule:_ Do NOT refactor the whole file at once. 1. Identify ONE smell. 2. Plan ONE change. 3. Execute & Run Tests. 4. If tests pass, commit. 5. Repeat.
   - _Order:_ Always refactor from Lowest Risk to Highest Risk.
6. **Verify**: Run tests + global checks. Ensure Characterization Tests still pass.
   - **Template:** `TEST_COVERAGE_ANALYSIS.md`

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
