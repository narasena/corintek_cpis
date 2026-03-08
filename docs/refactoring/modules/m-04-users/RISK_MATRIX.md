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
| F1 | `src/features/users/services/user-mutations.ts`| 255 | 🟡 | **MUTATIONS**: Handles data changes and password security. Moderate complexity. |
| F2 | `src/features/users/components/user-form.tsx` | 403 | 🔴 | **GOD COMPONENT**: Extremely complex UI logic, still needs decomposition in Phase 4. |
| F3 | `src/features/users/actions.ts` | 159 | 🟡 | **ENTRY POINT**: Cross-layer dependency between UI and Service. |
| F4 | `src/features/users/services/user-queries.ts` | 119 | 🟡 | **QUERIES**: Focused on data retrieval. Lower impact than mutations. |
| F5 | `src/features/users/components/profile-form.tsx` | 231 | 🟡 | **COMPLEX UI**: Handles profile updates and avatar uploads. |
| F6 | `src/features/users/utils.ts` | 68 | 🟡 | **SHARED INFRA**: Defines shared Prisma select objects. |
| F7 | `src/features/users/service.ts` | 9 | 🟢 | **FACADE**: Simple re-export file for backward compatibility. |
| F8 | `src/features/users/components/user-dialog.tsx` | 46 | 🟢 | **UI WRAPPER**: Simple dialog container. |

---

## Summary

| Risk Level | Count | Files |
| :--------: | :---: | ----- |
|  🔴 HIGH   |   1   | `user-form.tsx` |
| 🟡 MEDIUM  |   5   | `user-mutations.ts`, `user-queries.ts`, `actions.ts`, `profile-form.tsx`, `utils.ts` |
|   🟢 LOW   |   2   | `service.ts`, `user-dialog.tsx` |
