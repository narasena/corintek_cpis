# M-03: Shared Components & Infrastructure — Risk Matrix

> Updated 2026-03-08

---

## Risk Classification Criteria

| Level     | Criteria                                                          |
| --------- | ----------------------------------------------------------------- |
| 🔴 HIGH   | Core foundation logic, heavily coupled, many dependents, god class |
| 🟡 MEDIUM | Shared utilities/types, moderate coupling, cross-layer dependency |
| 🟢 LOW    | UI-only, isolated leaf module, few/no dependents                  |

---

## Risk Table

| ID   | File                                          | Lines | Risk | Reason                                      |
| ---- | --------------------------------------------- | ----: | :--: | ------------------------------------------- |
| F1   | `src/components/data-table.tsx`               |   215 |  🟢  | Orchestrator logic extracted to hook        |
| F2   | `src/lib/search-filter-service.ts`            |   310 |  🟢  | Algorithms extracted; bounded cache         |
| F3   | `src/lib/rbac.ts`                             |   128 |  🟢  | Fixed greedy matching; strict boundaries    |
| F4   | `src/lib/action-factory.ts`                   |    95 |  🟢  | Logic decoupled from feature composition    |
| F5   | `src/components/camera-input.tsx`             |   285 |  🟢  | Migrated to useObjectURL hook               |
| F6   | `src/lib/error-handler-service.ts`            |   180 |  🟢  | Refactored to context-aware constants       |
| F7   | `src/lib/jwt.ts`                               |    88 |  🟢  | Refactored to TActionResult pattern         |
| F8   | `src/components/app-sidebar.tsx`              |    51 |  🟢  | Refactored to data-driven mapping           |
| F9   | `src/components/multi-select.tsx`             |   163 |  🟢  | UI Component; well-encapsulated logic       |
| F10  | `src/components/virtual-list.tsx`             |   141 |  🟢  | Performance UI; isolated logic              |
| F11  | `src/components/crud-dialog.tsx`              |    45 |  🟢  | Simple UI Wrapper                           |
| F12  | `src/lib/prisma.ts`                           |    30 |  🟢  | Simple singleton factory                    |

---

## Summary

| Risk Level | Count | Files                                                                 |
| :--------: | :---: | --------------------------------------------------------------------- |
|  🔴 HIGH   |   0   | — |
| 🟡 MEDIUM  |   0   | — |
|   🟢 LOW   |   12  | All module files refactored, standardized, and decoupled.             |
