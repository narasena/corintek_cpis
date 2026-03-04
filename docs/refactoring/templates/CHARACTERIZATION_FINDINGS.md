# {Module Name} — Characterization Test Findings

> Date: {YYYY-MM-DD}

This document captures surprising/buggy behavior discovered while writing characterization tests. These behaviors are **current behavior** that should be preserved during refactoring.

<!-- PROMPT FOR AI AGENT:
"For this module:
1. Create characterization tests that capture CURRENT behavior (main path, edge cases, errors).
2. Identify Critical User Journeys and generate required End-to-End (E2E) test scenarios.
3. For complex logic, extract the implicit contract (SDD) specifying inputs, outputs, side-effects, and invariants before writing tests.
4. Document any surprising/buggy behavior in this file.
Goal: Lock down current behavior and infer contracts, do not test correctness yet."
-->

---

## 1. {Component/Hook Name}

### 1.1 {Finding Title}

**Location:** `{file}:{line}`

**Behavior:** {Description of what happens}

**Implication:** {Why this matters or what it breaks if changed}

**Risk if changed:** {Low/Medium/High}

---

## 2. Summary of Findings

| #   | Location | Finding   | Risk Level | Action Needed   |
| --- | -------- | --------- | ---------- | --------------- |
| 1   | {file}   | {Finding} | {Level}    | {e.g. Document} |

---

## 3. Test Coverage Summary

**Created test files:**

1. `{test_file_path}`

**Total:** {Count} characterization tests

---

## 4. E2E / Critical User Journeys

**End-to-End Scenarios identified to run against the full application:**

| #   | Scenario Name            | Description                                   | Status    |
| --- | ------------------------ | --------------------------------------------- | --------- |
| 1   | {e.g. Happy Path Create} | {User creates a new record successfully}      | {Pending} |
| 2   | {e.g. Validation Error}  | {User Submits empty form, sees toaster error} | {Pending} |
