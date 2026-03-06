# M-03: Shared Components & Infrastructure — Risk Matrix

> Updated 2026-03-06

---

## Risk Classification Criteria

| Level     | Criteria                                                          |
| --------- | ----------------------------------------------------------------- |
| 🔴 HIGH   | Core foundation logic, heavily coupled, used by ALL modules, God Class |
| 🟡 MEDIUM | Complex shared utilities, moderate coupling, browser API integrations |
| 🟢 LOW    | UI-only, leaf components, stable infrastructure, few/no dependents |

---

## Risk Table

| ID   | File                                    | Lines | Risk | Reason                                                                 |
| ---- | --------------------------------------- | ----: | :--: | ---------------------------------------------------------------------- |
| F1   | `src/lib/action-factory.ts`             |   110 |  🔴  | Central orchestration for all server actions. High impact on regressions. |
| F3   | `src/lib/rbac.ts`                       |   303 |  🔴  | SSOT for security. God configuration. Directly controls route access. |
| F4   | `src/components/data-table.tsx`         |   316 |  🔴  | God Component used in all CRUD views. High complexity (Desktop/Mobile). |
| F5   | `src/components/camera-input.tsx`       |   276 |  🟡  | Browser API integration. Logic simplified via pipeline extraction.     |
| F2   | `src/lib/auth-helpers.ts`               |    72 |  🟢  | Foundation session management. Domain logic removed. Resolved CIR-1.   |
| F6   | `src/lib/utils/image-compression.ts`    |    92 |  🟢  | Refactored to use Canvas utility. Pure coordinator logic now.          |
| F14  | `src/lib/utils/canvas.ts`               |   135 |  🟢  | Foundational Canvas logic. Decoupled and atomic.                       |
| F8   | `src/components/app-sidebar.tsx`        |    69 |  🟢  | Refactored to modular subgroups. Schematic logic extracted.            |
| F15  | `src/lib/constants/navigation.ts`       |    84 |  🟢  | Navigation schema SSOT. Low logic, high reuse.                         |
| F16  | `src/components/nav-main.tsx`           |    56 |  🟢  | Refactored to support categorized groups.                              |
| F9   | `src/lib/jwt.ts`                        |    96 |  🟢  | Decoupled security primitive. Implemented robust error handling.       |
| F10  | `src/components/multi-select.tsx`       |   163 |  🟢  | Shared form primitive. Extracted MultiSelectBadge sub-component.       |
| F11  | `src/lib/r2-upload.ts`                  |    31 |  🟢  | Simple utility wrapper. Isolated dependency.                           |
| F12  | `src/lib/prisma.ts`                     |    41 |  🟢  | Encapsulated singleton with lazy initialization and environment validation. |
| F13  | `src/lib/constants/auth.ts`             |    23 |  🟢  | Foundational security constants. SSOT for infra layer.                 |

---

## Summary

| Risk Level | Count | Files                                                                 |
| :--------: | :---: | --------------------------------------------------------------------- |
|  🔴 HIGH   |   3   | `action-factory.ts`, `rbac.ts`, `data-table.tsx`                      |
| 🟡 MEDIUM  |   1   | `camera-input.tsx`                                                    |
|   🟢 LOW   |   11  | `auth-helpers.ts`, `image-compression.ts`, `canvas.ts`, `app-sidebar.tsx`, `nav-main.tsx`, `navigation.ts`, `jwt.ts`, `multi-select.tsx`, `r2-upload.ts`, `prisma.ts`, `auth.ts (constants)` |
