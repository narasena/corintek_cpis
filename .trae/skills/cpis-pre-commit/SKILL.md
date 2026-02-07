---
name: cpis-pre-commit
description: Checks if ROADMAP.md needs updating before a commit. Invoke before committing feature work (not bug fixes).
---

# CPIS Pre-Commit Check

This skill enforces the workflow rule: **"Update ROADMAP.md before committing feature work."**

## When to Use

Invoke this skill when:
- The user asks to "commit" or "push" changes.
- You have completed a task that might be tracked in the roadmap.
- You are about to run `git commit`.

**Do NOT invoke this skill when:**
- The changes are purely for "bug fixes" or "refactoring" (unless they are explicitly tracked in the roadmap).
- The user explicitly says "skip roadmap check".

## Instructions

1.  **Analyze the Changes**:
    *   Look at the files you modified or created.
    *   Determine if they correspond to a "Scope ID" or "Task" in `ROADMAP.md`.

2.  **Check ROADMAP.md**:
    *   Read `ROADMAP.md`.
    *   Search for the relevant task or feature.
    *   Check if it is marked as completed (`[x]`).

3.  **Action**:
    *   **If the task is found but not marked**:
        *   Update `ROADMAP.md` to mark it as `[x]`.
        *   Add `ROADMAP.md` to the staging area (`git add ROADMAP.md`).
    *   **If the task is not found**:
        *   Ask the user if this task should be added to the roadmap (optional, depending on confidence).
    *   **If it's a bug fix**:
        *   Proceed without updating the roadmap.

4.  **Commit Message**:
    *   Ensure the commit message references the Scope ID if applicable (e.g., `feat(ops): OPS-01 ...`).

## Example

**Scenario**: You just implemented "Password Reset" (OPS-02).
**Action**:
1.  Read `ROADMAP.md`.
2.  Find `OPS-02` section.
3.  Mark `[x] Server Action to hash new password...` as done.
4.  `git add ROADMAP.md`.
5.  Proceed with commit.
