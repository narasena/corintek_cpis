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
| F1   | `src/lib/rbac.ts`                             |   128 |  🟢  | Fixed greedy matching; strict boundaries    |
| F2   | `src/components/data-table.tsx`               |   306 |  🔴  | High UI coupling; simultaneous DOM rendering|
| F3   | `src/lib/search-filter-service.ts`            |   360 |  🟡  | Capped cache & flattened logic              |
| F4   | `src/lib/action-factory.ts`                   |   116 |  🟡  | Refactored to typed error resolution        |
| F5   | `src/components/camera-input.tsx`             |   300 |  🟢  | Added URL revocation lifecycle              |
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
|  🔴 HIGH   |   1   | `data-table.tsx` |
| 🟡 MEDIUM  |   2   | `search-filter-service.ts`, `action-factory.ts` |
|   🟢 LOW   |   9   | `rbac.ts`, `camera-input.tsx`, `error-handler-service.ts`, `jwt.ts`, `app-sidebar.tsx`, `multi-select.tsx`, `virtual-list.tsx`, `crud-dialog.tsx`, `prisma.ts` |
