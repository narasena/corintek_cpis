# M-03: Shared Components & Infrastructure — Risk Matrix

> Updated 2026-03-06

---

## Risk Classification Criteria

| Level     | Criteria                                                          |
| --------- | ----------------------------------------------------------------- |
| 🔴 HIGH   | Core foundation logic, heavily coupled, used by ALL modules, God Class |
| 🟡 MEDIUM | Complex shared utilities, moderate coupling, browser API integrations |
| 🟢 LOW    | UI-only, leaf components, few/no dependents                       |

---

## Risk Table

| ID   | File                                    | Lines | Risk | Reason                                                                 |
| ---- | --------------------------------------- | ----: | :--: | ---------------------------------------------------------------------- |
| F1   | `src/lib/action-factory.ts`             |   107 |  🔴  | Central orchestration for all server actions. High impact on regressions. |
| F2   | `src/lib/auth-helpers.ts`               |   118 |  🔴  | Manages session and actor extraction. Involved in CIR-1 (Circular Dep). |
| F3   | `src/lib/rbac.ts`                       |   303 |  🔴  | SSOT for security. God configuration. Directly controls route access. |
| F4   | `src/components/data-table.tsx`         |   316 |  🔴  | God Component used in all CRUD views. High complexity (Desktop/Mobile). |
| F5   | `src/components/camera-input.tsx`       |   356 |  🟡  | Complex logic integration (Browser API + Processing). Logic heavy.     |
| F6   | `src/lib/utils/image-compression.ts`    |   128 |  🟡  | Native Canvas manipulation. Prone to silent errors (Format conversion). |
| F8   | `src/components/app-sidebar.tsx`        |   132 |  🟡  | Layout critical. Depends on RBAC.                                      |
| F9   | `src/lib/jwt.ts`                        |    96 |  🟢  | Decoupled security primitive. Implemented robust error handling.       |
| F10  | `src/components/multi-select.tsx`       |   163 |  🟢  | Shared form primitive. Extracted MultiSelectBadge sub-component.       |
| F11  | `src/lib/r2-upload.ts`                  |    31 |  🟢  | Simple utility wrapper. Isolated dependency.                           |
| F12  | `src/lib/prisma.ts`                     |    41 |  🟢  | Encapsulated singleton with lazy initialization and environment validation. |
| F13  | `src/lib/constants/auth.ts`             |    23 |  🟢  | Foundational security constants. SSOT for infra layer.                 |

---

## Summary

| Risk Level | Count | Files                                                                 |
| :--------: | :---: | --------------------------------------------------------------------- |
|  🔴 HIGH   |   4   | `action-factory.ts`, `auth-helpers.ts`, `rbac.ts`, `data-table.tsx`   |
| 🟡 MEDIUM  |   4   | `camera-input.tsx`, `image-compression.ts`, `app-sidebar.tsx`, `jwt.ts` |
|   🟢 LOW   |   4   | `multi-select.tsx`, `r2-upload.ts`, `prisma.ts`, `auth.ts (constants)` |
