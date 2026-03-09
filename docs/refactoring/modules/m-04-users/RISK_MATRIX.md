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
| F1 | `src/features/users/services/user-mutations.ts`| 255 | 🟡 | **MUTATIONS**: Handles core data changes. Moderate complexity. |
| F2 | `src/features/users/hooks/use-user-form.ts` | 123 | 🟡 | **FORM LOGIC**: Complex state management for user creation/editing. |
| F3 | `src/features/users/actions.ts` | 159 | 🟡 | **ENTRY POINT**: Cross-layer dependency between UI and Service. |
| F4 | `src/features/users/services/user-queries.ts` | 119 | 🟡 | **QUERIES**: Focused on data retrieval. |
| F5 | `src/features/users/components/profile-form.tsx` | 231 | 🟡 | **COMPLEX UI**: Handles profile updates and avatar uploads. |
| F6 | `src/features/users/utils.ts` | 142 | 🟢 | **DRY INFRA**: Derived selections and schemas. Low complexity leaf. |
| F7 | `src/features/users/components/user-form.tsx` | 73 | 🟢 | **ORCHESTRATOR**: Simple container for sub-sections. |
| F8 | `src/features/users/components/form-sections/*` | ~300 | 🟢 | **UI SECTIONS**: Focused, single-purpose UI components. |
| F9 | `src/features/users/service.ts` | 9 | 🟢 | **FACADE**: Simple re-export file. |
| F10| `src/features/users/components/user-dialog.tsx` | 46 | 🟢 | **UI WRAPPER**: Simple dialog container. |
| F11| `src/features/users/hooks/use-user-clients.ts` | 28 | 🟢 | **HOOK**: Isolated fetching logic. |

---

## Summary

| Risk Level | Count | Files |
| :--------: | :---: | ----- |
|  🔴 HIGH   |   0   | **NONE** - All God Files resolved. |
| 🟡 MEDIUM  |   5   | Mutations, Form Hook, Actions, Queries, Profile Form |
|   🟢 LOW   |   6   | Utils, Orchestrator, UI Sections, Facade, Dialog, Clients Hook |
  