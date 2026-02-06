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
