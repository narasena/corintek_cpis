---
alwaysApply: true
description: STRICT rules for refactoring. Invoke when tempted to clean up code or when user asks for refactoring.
---
# Refactoring Protocol: Rescue Mode

> **STATUS:** 🛑 **STRICTLY LIMITED**
> Refactoring is currently a luxury we cannot afford.

## 1. The Golden Rule
**"If it works, DO NOT TOUCH IT."**

## 2. When to Refactor (Green Light ✅)
You may only refactor if:
1.  **Blocker:** The existing code prevents the implementation of a new, required feature.
2.  **Bug Fix:** The code is demonstrably broken (fails tests or user reports).
3.  **Security:** You found a critical security vulnerability (e.g., SQL injection, exposed secret).
4.  **Dead Code:** Removing *unused* files to reduce noise (verify with `grep` first).

## 3. When NOT to Refactor (Red Light ❌)
Do NOT refactor for:
1.  **Aesthetics:** "Making it look nicer."
2.  **Performance:** Unless the page takes >3s to load.
3.  **Style:** "I prefer `const` over `let`" or "This should be a separate function."
4.  **DRY (Don't Repeat Yourself):** A little duplication is better than wrong abstraction in a crisis.

## 4. Anti-Pattern: The "Drive-By" Refactor
*   **Definition:** Fixing a typo or renaming a variable in a file you opened for a completely different reason.
*   **Action:** **STOP.** Do not pollute your PR/commit with unrelated changes.

## 5. Decision Process
Before changing existing code, ask:
*   *"Does this directly contribute to the current ticket?"*
    *   **No:** Revert changes.
    *   **Yes:** Proceed, but keep it minimal.
