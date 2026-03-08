# M-04: Users — Risk Matrix

> Updated 2026-03-08

<!-- PROMPT FOR AI AGENT:
"Based on the dependency map, categorize all files in this module by Risk Level:
- HIGH RISK: Core business logic, heavily coupled, many dependents, god class
- MEDIUM RISK: Shared utilities/types, moderate coupling
- LOW RISK: UI-only, isolated leaf module, few/no dependents
Output a Risk Table."
-->

---

## Risk Classification Criteria

| Level     | Criteria                                                          |
| --------- | ----------------------------------------------------------------- |
| 🔴 HIGH   | Core business logic, heavily coupled, many dependents, god class  |
| 🟡 MEDIUM | Shared utilities/types, moderate coupling, cross-layer dependency |
| 🟢 LOW    | UI-only, isolated leaf module, few/no dependents                  |

---

## Risk Table

| ID   | File | Lines | Risk | Reason |
| ---- | ---- | ----: | :--: | ------ |
| F1 | `src/features/users/service.ts` | 319 | 🔴 | **CORE LOGIC**: Handles all user CRUD, password hashing, and RBAC enforcement. High impact on auth. |
| F2 | `src/features/users/components/user-form.tsx` | 417 | 🔴 | **GOD COMPONENT**: Extremely complex UI logic, handles both create/edit modes and role-based conditional fields. |
| F3 | `src/features/users/actions.ts` | 154 | 🟡 | **ENTRY POINT**: Cross-layer dependency between UI and Service. Used by multiple external pages. |
| F4 | `src/features/users/components/profile-form.tsx` | 226 | 🟡 | **COMPLEX UI**: Handles profile updates and avatar uploads (R2 integration). |
| F5 | `src/features/users/utils.ts` | 68 | 🟡 | **SHARED INFRA**: Defines the Prisma select object used by all service methods. Change impacts every read. |
| F6 | `src/features/users/service-admin.ts` | 66 | 🟢 | **ISOLATED**: Handles specific admin utilities (restore/delete). Low coupling. |
| F7 | `src/features/users/components/user-dialog.tsx` | 46 | 🟢 | **UI WRAPPER**: Simple dialog container for the form. Low complexity. |

---

## Summary

| Risk Level | Count | Files |
| :--------: | :---: | ----- |
|  🔴 HIGH   |   2   | `service.ts`, `user-form.tsx` |
| 🟡 MEDIUM  |   3   | `actions.ts`, `profile-form.tsx`, `utils.ts` |
|   🟢 LOW   |   2   | `service-admin.ts`, `user-dialog.tsx` |
