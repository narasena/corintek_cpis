---
name: 'git-task-start'
description: 'Enforces git branching strategy. Invoke IMMEDIATELY when starting any new coding task, feature, bugfix, or refactor.'
---

# Git Task Starter

This skill ensures you never commit to protected branches (`main`, `dev`, `development`, `stage`) and enforces the project's branching and commit naming conventions.

## 🛑 Critical Protocol

**BEFORE writing any code or applying changes, you MUST:**

1.  **Check Current Branch:**
    Run `git branch --show-current`.

2.  **Validate Branch:**
    - If current branch is `main`, `master`, `dev`, `development`, `development_v2`, `stage`: **STOP**.
    - You **MUST** create a new branch.

3.  **Create Branch (If Needed):**
    - Ask the user for the task type (Feature, Bug, Refactor) if not clear.
    - Enforce Naming Convention:
      - Feature: `feat/<domain>/<action>`
      - Bug Fix: `fix/<domain>/<issue>`
      - Refactor: `refactor/<scope>`
    - Command: `git checkout -b <branch_name>`

4.  **Verify:**
    - Confirm you are on the new branch.
    - Proceed with the task.

## 📝 Commit Convention Reminder

When ready to commit, ensure you use:

- `feat(scope): message`
- `fix(scope): message`
- `refactor(scope): message`
