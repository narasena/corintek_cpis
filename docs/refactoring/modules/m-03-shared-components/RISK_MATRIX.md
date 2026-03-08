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
| F1   | `src/lib/rbac.ts`                             |   121 |  🔴  | System security foundation; greedy matching |
| F2   | `src/components/data-table.tsx`               |   306 |  🔴  | High UI coupling; simultaneous DOM rendering|
| F3   | `src/lib/di/factories.ts`                     |    45 |  🔴  | Structural inversion; foundation-to-feature  |
| F4   | `src/lib/search-filter-service.ts`            |   358 |  🔴  | High complexity logic; memory leak in cache |
| F5   | `src/lib/action-factory.ts`                   |   116 |  🟡  | Refactored to typed error resolution        |
| F6   | `src/components/camera-input.tsx`             |   300 |  🟢  | Added URL revocation lifecycle              |
| F7   | `src/lib/error-handler-service.ts`            |   180 |  🟢  | Refactored to context-aware constants       |
| F8   | `src/lib/jwt.ts`                               |    88 |  🟢  | Refactored to TActionResult pattern         |
| F9   | `src/components/app-sidebar.tsx`              |    51 |  🟢  | Refactored to data-driven mapping           |
| F10  | `src/components/multi-select.tsx`             |   163 |  🟢  | UI Component; well-encapsulated logic       |
| F11  | `src/components/virtual-list.tsx`             |   141 |  🟢  | Performance UI; isolated logic              |
| F12  | `src/components/crud-dialog.tsx`              |    45 |  🟢  | Simple UI Wrapper                           |
| F13  | `src/lib/prisma.ts`                           |    30 |  🟢  | Simple singleton factory                    |

---

## Summary

| Risk Level | Count | Files                                                                 |
| :--------: | :---: | --------------------------------------------------------------------- |
|  🔴 HIGH   |   4   | `rbac.ts`, `data-table.tsx`, `di/factories.ts`, `search-filter-service.ts` |
| 🟡 MEDIUM  |   1   | `action-factory.ts` |
|   🟢 LOW   |   8   | `camera-input.tsx`, `error-handler-service.ts`, `jwt.ts`, `app-sidebar.tsx`, `multi-select.tsx`, `virtual-list.tsx`, `crud-dialog.tsx`, `prisma.ts` |
