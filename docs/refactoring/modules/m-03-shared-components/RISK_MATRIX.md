# M-03: Shared Components & Infrastructure — Risk Matrix

> Updated 2026-03-06

---

## Risk Classification Criteria

| Level     | Criteria                                                          |
| --------- | ----------------------------------------------------------------- |
| 🔴 HIGH   | Core foundation logic, heavily coupled, God Class, fragile        |
| 🟡 MEDIUM | Complex shared utilities, moderate coupling                       |
| 🟢 LOW    | UI-only, modularized logic, decoupled infrastructure, atomic      |

---

## Risk Table

| ID   | File                                    | Lines | Risk | Reason                                                                 |
| ---- | --------------------------------------- | ----: | :--: | ---------------------------------------------------------------------- |
| F1   | `src/lib/action-factory.ts`             |   110 |  🟢  | **Refactored**: Decoupled via DI. Full type safety.                    |
| F3   | `src/lib/rbac.ts`                       |   121 |  🟢  | **Refactored**: Logic coordinator. Policies modularized.               |
| F4   | `src/components/data-table/index.tsx`   |   110 |  🟢  | **Refactored**: Decomposed into specific view components.              |
| F5   | `src/components/camera-input.tsx`       |   276 |  🟢  | **Refactored**: Simplified via unified processing pipeline.            |
| F2   | `src/lib/auth-helpers.ts`               |    72 |  🟢  | **Refactored**: Foundational session logic. Domain logic removed.      |
| F6   | `src/lib/utils/image-compression.ts`    |    92 |  🟢  | **Refactored**: Pure coordinator using Canvas utility.                 |
| F14  | `src/lib/utils/canvas.ts`               |   135 |  🟢  | **Foundational**: Centralized Canvas logic. High reuse.                |
| F8   | `src/components/app-sidebar.tsx`        |    69 |  🟢  | **Refactored**: Modular subgroups. Schema decoupled.                   |
| F15  | `src/lib/constants/navigation.ts`       |    84 |  🟢  | **Schema**: Single source of truth for navigation.                    |
| F16  | `src/components/nav-main.tsx`           |    56 |  🟢  | **Modular**: Standardized subgroup rendering.                          |
| F9   | `src/lib/jwt.ts`                        |    96 |  🟢  | **Refactored**: Decoupled security primitive.                          |
| F10  | `src/components/multi-select.tsx`       |   163 |  🟢  | **Refactored**: Extracted sub-components.                              |
| F11  | `src/lib/r2-upload.ts`                  |    31 |  🟢  | **Atomic**: Standard wrapper for R2 storage.                           |
| F12  | `src/lib/prisma.ts`                     |    41 |  🟢  | **Encapsulated**: Validated lazy singleton.                            |
| F13  | `src/lib/constants/auth.ts`             |    23 |  🟢  | **Foundational**: Security primitives SSOT.                            |
| F17  | `src/lib/rbac/types.ts`                 |    46 |  🟢  | RBAC type definitions SSOT.                                            |
| F18  | `src/lib/rbac/policies/*.ts`            |   164 |  🟢  | Role-specific modular policies.                                        |
| F19  | `src/lib/action-helpers.ts`             |    40 |  🟢  | Standard action response primitives.                                   |
| F20  | `src/components/data-table/*.tsx`       |   231 |  🟢  | Specific view components (Desktop/Mobile/Types).                       |

---

## Summary

| Risk Level | Count | Files                                                                 |
| :--------: | :---: | --------------------------------------------------------------------- |
|  🔴 HIGH   |   0   | None remaining. All God components decomposed.                         |
| 🟡 MEDIUM  |   0   | None remaining. Infrastructure stabilized.                             |
|   🟢 LOW   |   20  | Entire M-03 core manifest refactored to atomic, decoupled components.  |
