---
alwaysApply: true
description: Workflow for Git and TDD.
---
# Workflow: Git & TDD

## 1. Git Strategy
| Type | Branch | Example |
| :--- | :--- | :--- |
| Feature | `feat/<domain>/<action>` | `feat/auth/login` |
| Fix | `fix/<domain>/<issue>` | `fix/user/dup-email` |
| Refactor | `refactor/<scope>` | `refactor/db-schema` |
| Main | **STOP** | Branch first! |

**Atomic Commits:** One logical change = one commit.

## 2. TDD (Test Later)
*   **Suspended:** No Red-Green-Refactor.
*   **Protocol:** Implement -> Verify Manually -> Test Complex Logic (Service Layer only).
*   **Limit:** Stop after 3 failures.
