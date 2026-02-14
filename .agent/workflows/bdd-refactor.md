---
alwaysApply: true
description: Workflow for BDD and Refactoring.
---
# Workflow: BDD & Refactoring

## 1. BDD (Define First)
**Rule:** Define **Input -> Process -> Outcome** before coding.

### Example
**Feature:** Create Project
1.  **Input:** Name (req), ClientID (req).
2.  **Validation:** Name unique per Client.
3.  **Action:** `createProject` -> `prisma.create`.
4.  **Success:** Redirect, Toast "Created".
5.  **Error:** Toast "Duplicate Name".

## 2. Refactoring (Strict Limits)
**Rule:** "If it works, DO NOT TOUCH IT."

| Condition | Verdict |
| :--- | :--- |
| **Blocker** | ✅ Required for new feature. |
| **Bug Fix** | ✅ Broken code. |
| **Security** | ✅ Vulnerability. |
| **Aesthetics** | ❌ "Looks nicer." |
| **Style** | ❌ Preference. |

## 3. Heavy Refactor Protocol (MVP Rescue Mode)
**Rule:** Refactor in slices with explicit safety rails, no TDD.

### A. Define the Slice
1.  **Outcome:** Single user-visible result.
2.  **Boundary:** Files and modules touched.
3.  **Invariant:** What must not change (API, schema, routes, UI contract).

### B. Map the Current Flow
1.  **Entry Point:** Page or component.
2.  **Action:** Server Action name.
3.  **Service:** Business logic and Prisma calls.
4.  **Data:** Input/output types and Zod schemas.

### C. Refactor Plan (One Slice Only)
1.  **Step List:** Ordered, minimal steps.
2.  **Rollback:** What to revert if a step fails.
3.  **Risk:** Highest-risk change identified.

### D. Execution Rules
1.  **No new packages.**
2.  **No architectural changes.**
3.  **Preserve interfaces unless explicitly changing behavior.**
4.  **Keep functions small and replace in place.**

### E. Verification (Manual)
1.  **Happy Path:** Main user flow works.
2.  **Error Path:** Expected failure path shows toast.
3.  **Data:** No schema regressions.

### F. Stop Conditions
1.  **Unexpected data change.**
2.  **New errors without a rollback.**
3.  **Scope growth beyond the slice.**
