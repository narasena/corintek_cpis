# Log-Sheets Module — Risk Matrix

> Derived from [DEPENDENCY_MAP.md](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/DEPENDENCY_MAP.md) | 2026-02-14

---

## Risk Classification Criteria

| Level     | Criteria                                                          |
| --------- | ----------------------------------------------------------------- |
| 🔴 HIGH   | Core business logic, heavily coupled, many dependents, god class  |
| 🟡 MEDIUM | Shared utilities/types, moderate coupling, cross-layer dependency |
| 🟢 LOW    | UI-only, isolated leaf module, few/no dependents                  |

---

## Risk Table

| ID      | File                                                 | Lines | Risk | Reason                                                                                                                                                                                                                                          |
| ------- | ---------------------------------------------------- | ----: | :--: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F2**  | `features/log-sheets/service.ts`                     |  1011 |  🔴  | **God module.** 17 exported functions. All mutations flow through here. Single point of failure for CRUD, validation, and business rules. Coupled to Prisma, RBAC, and 4 external feature modules.                                              |
| **F1**  | `features/log-sheets/actions.ts`                     |   509 |  🔴  | **Central action hub.** 14 server actions. Every app-layer write operation depends on this file. Thin wrappers over F2 but owns Zod validation, auth gating, and R2 upload logic. Depended on by 7 app-layer files (A3, A6, A7, A12, A14, A15). |
| **A7**  | `[logSheetId]/page.tsx`                              |  1167 |  🔴  | **God component.** Orchestrates 7 hooks, 2 child components, 4 action calls. ~930 lines of JSX with inline table rendering. Any change to entry structure, machine logic, or category display requires touching this file.                      |
| **F3**  | `features/log-sheets/types.ts`                       |   186 |  🔴  | **Type contract.** Zod schemas + TS types imported by 9 files (A4, A6, A8, F1, F2, F4, F6 + indirect). Breaking a schema shape cascades across both layers.                                                                                     |
| **A8**  | `[logSheetId]/types.ts`                              |   106 |  🟡  | **Local type hub.** Imported by 10 app-layer files (A7, A9, A11, A12-A16, A18). Duplicates some types from F3 (TEntryState, TParameter). Changes ripple through all detail-page hooks/components.                                               |
| **F4**  | `features/log-sheets/utils.ts`                       |    38 |  🟡  | **Shared utility.** `makeEntryKey` and `isLogSheetEntryEmpty` used by F1, F2, F6, A11, A16, A18. Small but high fan-out — a key format change breaks entry matching everywhere.                                                                 |
| **A18** | `hooks/use-log-sheet-validation.ts`                  |   202 |  🟡  | **Client validation.** Duplicates server-side validation logic from F2. Must stay in sync with `validateLogSheetForSubmission`/`validateLogSheetForApproval` or submissions will have inconsistent behavior.                                    |
| **F6**  | `components/log-sheet-preview.tsx`                   |   713 |  🟡  | **Print preview.** Large but single-purpose. Exports `CATEGORY_ORDER` constant consumed by A13 (cross-layer coupling). Also duplicates `formatLimit` and `machinesForCategory` from app layer.                                                  |
| **A15** | `hooks/use-log-sheet-draft-saver.ts`                 |   144 |  🟡  | **Save orchestrator.** Coordinates 4 server action calls (header, entries, chemicals, photos). Failure in any step can leave partial saves. Central to data persistence flow.                                                                   |
| **A13** | `hooks/use-log-sheet-derived.ts`                     |   108 |  🟡  | **Derived data.** Computes categories, filtered machines, user display. Imports from F6 (cross-layer coupling concern). Duplicates `machinesForCategory` logic.                                                                                 |
| **A12** | `hooks/use-log-sheet-active-machines.ts`             |   105 |  🟡  | **Machine state.** Manages toggle/select/clear + persists via action. Changes affect which entries are visible and required in validation.                                                                                                      |
| **A16** | `hooks/use-log-sheet-draft-state.ts`                 |    93 |  🟡  | **Draft initializer.** Seeds local state from server data. Bridging layer between fetched detail (A14) and form state consumed by A7.                                                                                                           |
| **A9**  | `[logSheetId]/utils.ts`                              |    67 |  🟡  | **Local formatters.** `formatDate`, `formatLimit`, `isOutOfRange`. Duplicated in A4 and F6. Used by A7 and A11.                                                                                                                                 |
| **A6**  | `[projectId]/components/log-sheet-form.tsx`          |   195 |  🟢  | **Create form.** Isolated to project-level dialog. Depends on F1/F3 but no other app file depends on it (except A5 wrapper).                                                                                                                    |
| **A10** | `[logSheetId]/components/chemical-usage-section.tsx` |   211 |  🟢  | **Leaf component.** Self-contained CRUD for chemicals. Depends on external `chemicals` feature. Only consumed by A7.                                                                                                                            |
| **A11** | `[logSheetId]/components/mobile-entry-card.tsx`      |   201 |  🟢  | **Leaf component.** Mobile-only entry display. Imports from A8, A9, F4 but nothing depends on it except A7.                                                                                                                                     |
| **A14** | `hooks/use-log-sheet-detail-data.ts`                 |    35 |  🟢  | **Data fetcher.** Simple wrapper around `getLogSheetDetailAction`. Leaf hook consumed only by A7.                                                                                                                                               |
| **A17** | `hooks/use-log-sheet-technicians.ts`                 |    19 |  🟢  | **Data fetcher.** Fetches user list. Duplicates pattern in A6 but isolated. Leaf hook.                                                                                                                                                          |
| **F5**  | `components/log-sheet-header.tsx`                    |    75 |  🟢  | **Print header.** Stateless presenter. Only consumed by F6. No business logic.                                                                                                                                                                  |
| **A1**  | `page.tsx` (root)                                    |    63 |  🟢  | **List page.** Renders project table. Depends on external `projects` feature. Leaf page.                                                                                                                                                        |
| **A2**  | `components/project-columns.tsx`                     |    29 |  🟢  | **Column defs.** Stateless config. Only consumed by A1.                                                                                                                                                                                         |
| **A3**  | `[projectId]/page.tsx`                               |   136 |  🟢  | **List page.** Renders log-sheet table per project. Standard CRUD page with dialog.                                                                                                                                                             |
| **A4**  | `[projectId]/components/columns.tsx`                 |    75 |  🟢  | **Column defs.** Contains duplicated `formatDate` and `TLogSheetRow` type. Only consumed by A3.                                                                                                                                                 |
| **A5**  | `[projectId]/components/log-sheet-dialog.tsx`        |    35 |  🟢  | **Dialog wrapper.** Thin CrudDialog shell around A6. Leaf component.                                                                                                                                                                            |

---

## Summary

| Risk Level | Count  | Files                                          |
| :--------: | :----: | ---------------------------------------------- |
|  🔴 HIGH   | **4**  | F2, F1, A7, F3                                 |
| 🟡 MEDIUM  | **9**  | A8, F4, A18, F6, A15, A13, A12, A16, A9        |
|   🟢 LOW   | **12** | A6, A10, A11, A14, A17, F5, A1, A2, A3, A4, A5 |

> **Interpretation:** The 4 HIGH-risk files account for **2,873 lines (56% of total LOC)** and form the critical path for any log-sheet feature work. Changes to these files require careful regression testing.
