---
name: "cpis-heavy-refactor"
description: "Plan and execute heavy refactors safely in CPIS MVP rescue mode. Covers slice definition, invariants, action/service boundaries, rollback strategy, and manual verification gates. Use when: restructuring modules, untangling logic, or avoiding scope creep and regressions."
---

# CPIS Heavy Refactor Protocol

Use this skill when the user requests large refactors without TDD in MVP rescue mode.

## Core Principles
- Refactor only for blockers, bugs, or security.
- Work in small, user-visible slices.
- Preserve interfaces unless behavior change is required.
- No new packages and no architecture changes.

## Required Pre-Work
### Define the Slice
- Outcome: single user-visible result.
- Boundary: exact files and modules touched.
- Invariants: API, schema, routes, and UI contracts that must not change.

### Map the Flow
- Entry point: page or component.
- Action: server action name.
- Service: business logic and Prisma calls.
- Data: Zod schema and types.

## Refactor Plan Template
1. Step list: ordered, minimal steps.
2. Risk: highest-risk change identified.
3. Rollback: exact revert point per step.

## Execution Rules
- Replace in place; avoid broad renames.
- Keep changes local to the slice boundary.
- Update types and Zod schemas with each change.
- Preserve logging and error feedback conventions.

## Verification (Manual)
- Happy path for the slice.
- Error path shows toast feedback.
- No schema regressions or data loss.

## Stop Conditions
- Scope growth beyond the slice.
- New errors without a clear rollback.
- Unexpected data changes.
