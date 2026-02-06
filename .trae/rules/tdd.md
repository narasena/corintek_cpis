---
alwaysApply: false
description: Apply this rule when tasked with testing or verifying logic. STRICT TDD IS SUSPENDED. Use "Rescue Mode" strategy: Logic-only, Post-Implementation, Critical Paths only.
---

# Testing Strategy: Rescue Mode (No TDD)

> **CRITICAL CONTEXT:** This project is in "Rescue Mode" (2 Months Behind Schedule). Speed > Perfection.

## ⛔ strict TDD is SUSPENDED

Do **NOT** follow the standard Red-Green-Refactor cycle. Do **NOT** write tests before implementation.

## ✅ The "Rescue Mode" Testing Protocol

### 1. Scope: Business Logic ONLY

- **Target:** `src/features/*/service.ts` files containing complex calculations or state transitions.
- **Exclude:** UI Components, Server Actions (simple wiring), generic CRUD operations.
- **Rule:** If the logic is trivial (e.g., simple `db.create`), **SKIP TESTING**.

### 2. Timing: Test-After-Implementation

1. **Implement** the feature/fix first.
2. **Verify** manually (via UI or script).
3. **Write Tests** ONLY for critical complex logic to prevent regression.

### 3. Execution Constraints

- **Stop after 3 failures:** If a test is fighting you, delete the test and move on. Do not waste time debugging test harnesses.
- **No Mocks Hell:** Prefer integration tests with a test DB over complex mocking if it's faster.
- **Tooling:** Use the existing worker-based Vitest setup if available, or simple script-based verification.

## Summary Checklist

- [ ] Is this `service.ts` logic complex? (Yes -> Test)
- [ ] Is this a UI component? (Yes -> NO Test)
- [ ] Am I writing the test _after_ the code works? (Yes -> Good)
- [ ] Did I spend >15 mins fighting the test runner? (Yes -> DELETE TEST & ABORT)
