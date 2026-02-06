---
alwaysApply: false
description: Apply this rule when implementing new features, designing functionality, or consulting the project roadmap for next tasks.
---

# BDD Strategy: Rescue Mode (Pragmatic Behavior)

> **CRITICAL CONTEXT:** Strict Gherkin/Cucumber flows are **SUSPENDED**. We do not have time for formal syntax.

## ✅ The "Rescue Mode" BDD Protocol

You are right: **BDD is more important than TDD here.** Why? Because fixing _logic_ is faster than fixing _requirements_ after building the wrong thing.

### 1. The Rule: "Define, Then Code"

Before writing a single line of `actions.ts` or `service.ts`, you MUST articulate the behavior.

**Do NOT use:**

- ❌ `Given-When-Then` Gherkin syntax (too verbose)
- ❌ Cucumber tools
- ❌ Formal ".feature" files

**DO use:**

- ✅ **Input-Process-Output (IPO)** bullets
- ✅ **Happy Path** vs. **Error Path** definitions
- ✅ **Role Checks** (Who can do this?)

### 2. The Checklist (Mental or Scratchpad)

For every feature request, answer these 3 questions immediately:

1.  **Trigger:** What exact UI action fires this? (e.g., "User submits Create Project form")
2.  **Data:** What payload crosses the boundary? (e.g., `FormData` with `name`, `client_id`)
3.  **Outcome:**
    - **DB:** What records change?
    - **UI:** Where do we redirect? What Toast message appears?

### 3. Example: "Rescue BDD" in Action

**Bad (Vague):**

> "Implement project creation."

**Good (Rescue BDD):**

> **Feature:** Create Project
>
> 1.  **Input:** Name (req), ClientID (req), Description (opt).
> 2.  **Validation:** Zod schema check. Name must be unique per Client.
> 3.  **Action:** `createProjectAction` -> `prisma.project.create`.
> 4.  **Success:** Redirect to `/projects/[id]`, Toast: "Project Created".
> 5.  **Error:** If name exists -> Toast Error: "Duplicate Name".

### 4. Why this matters for Rescue Mode

- It prevents **"Rework Loops"** (building -> showing user -> user says "wrong" -> rebuilding).
- It acts as the spec for the `service.ts` logic.
