# Log-Sheets Module — Risk Matrix

> Derived from [DEPENDENCY_MAP.md](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/log-sheets/DEPENDENCY_MAP.md) | Updated 2026-02-24

---

## Risk Classification Criteria

| Level     | Criteria                                                          |
| --------- | ----------------------------------------------------------------- |
| 🔴 HIGH   | Core business logic, heavily coupled, many dependents, god class  |
| 🟡 MEDIUM | Shared utilities/types, moderate coupling, cross-layer dependency |
| 🟢 LOW    | UI-only, isolated leaf module, few/no dependents                  |

---

## Risk Table

| ID      | File                                                 | Lines | Risk | Reason                                                                                                                                                                                                                                                   |
| ------- | ---------------------------------------------------- | ----: | :--: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F2**  | `features/log-sheets/service.ts`                     |   634 |  🟡  | **Reduced from god module.** CRUD + detail fetching + signatures. Status/validation extracted to `log-sheet-status.service.ts`. Still core business layer but improved SRP. Coupled to Prisma, RBAC, parameters, machines, projects.                     |
| **F13** | `features/log-sheets/log-sheet-status.service.ts`    |   123 |  🟡  | **Status domain.** Handles status transitions, submission validation, approval validation. Single responsibility module with clear boundaries.                                                                                                           |
| **F1**  | `features/log-sheets/actions.ts`                     |   520 |  🔴  | **Central action hub.** 16+ server actions. Every app-layer write operation (create/update/status, entries, chemicals, photos, signatures, image uploads) depends on this file. Owns Zod validation, auth gating, R2 upload wiring.                      |
| **A7**  | `[logSheetId]/page.tsx`                              |   437 |  🟡  | **Reduced from god component.** Orchestrates 7 hooks, 3 feature components. Split into toolbar, machine selection, and category section components.                                                                                                      |
| **F3**  | `features/log-sheets/types.ts`                       |   200 |  🔴  | **Type contract.** Zod schemas + TS types used by actions, service, preview, validation, utils, and app-layer types. Breaking shape of `TLogSheet`, `TLogSheetEntry`, `TPreviewParameter`, etc. cascades through both app and feature layers.            |
| **A8**  | `[logSheetId]/types.ts`                              |   106 |  🟡  | **Local type hub.** Imported by 10 app-layer files (A7, A9, A11, A12–A16, A18). Duplicates some concepts from F3 (`TEntryState`, parameter/machine shapes). Changes ripple through all detail-page hooks/components.                                     |
| **F4**  | `features/log-sheets/utils.ts`                       |    38 |  🟡  | **Shared utility.** `makeEntryKey` and `isLogSheetEntryEmpty` used by F1, F2, F6, F9, A11, A16, A18. Small but high fan-out — a key format change breaks lookups in entries, validation, preview, and approval logic.                                    |
| **A18** | `hooks/use-log-sheet-validation.ts`                  |    79 |  🟡  | **Client validation adapter.** Maps page state into `TLogSheetValidationInput` and calls shared validator (F9). Bound to A7's state model and F9's schema; desync breaks client-side error messages vs server expectations.                              |
| **F6**  | `components/log-sheet-preview.tsx`                   |   713 |  🟡  | **Print preview.** Large but single-purpose. `CATEGORY_ORDER` and `machinesForCategory` extracted to `category-helpers.ts`. `formatLimit`/`formatRawWaterLimit` in `format-helpers.ts`.                                                                  |
| **A15** | `hooks/use-log-sheet-draft-saver.ts`                 |   144 |  🟡  | **Save orchestrator.** Coordinates multiple server actions (header, entries, chemicals, photos). Any change in save sequencing or error handling affects how partial drafts are persisted.                                                               |
| **A13** | `hooks/use-log-sheet-derived.ts`                     |   108 |  🟡  | **Derived data.** Computes categories, machines per category, and display names. Uses `CATEGORY_ORDER` and `usesChillers`/`usesCoolingTowers` from `category-helpers.ts` (cross-layer resolved).                                                         |
| **A12** | `hooks/use-log-sheet-active-machines.ts`             |   105 |  🟡  | **Machine state.** Manages toggle/select/clear of active chillers/CTs and persists via server actions. Directly influences which entries are required by validation and visible in A7.                                                                   |
| **A16** | `hooks/use-log-sheet-draft-state.ts`                 |    93 |  🟡  | **Draft initializer.** Bridges fetched detail (A14) with local form state for A7, including entry/chemical/machine state. Any mismatch between server detail shape and local state will surface here.                                                    |
| **A9**  | `[logSheetId]/utils.ts`                              |    67 |  🟡  | **Local formatters.** `formatDate`, `formatLimit`, `formatRawWaterLimit`, `isOutOfRange`. Duplicated or mirrored in A4 and F6. Used by A7 and A11 for display and range highlighting.                                                                    |
| **F9**  | `features/log-sheets/validation.ts`                  |   220 |  🟡  | **Shared validation logic.** Centralises entry completeness rules for chillers, cooling towers, raw water, and consumption. Consumed by A18 and tightly coupled to `makeEntryKey` and parameter categories. Differences from F2’s validations are risky. |
| **F10** | `features/log-sheets/approval-validation.ts`         |   198 |  🟡  | **Approval validator.** Enforces numeric ranges and required fields at APPROVED stage. Called from F2 and depends on detail view types and `makeEntryKey`. Single caller, but mistakes here break approval correctness.                                  |
| **F11** | `features/log-sheets/log-sheet-status.ts`            |    53 |  🟡  | **Status transition rules.** Decides if DRAFT → SUBMITTED → APPROVED transitions are allowed and whether approval validation is required. Used by F2; errors here lead to incorrect status flow or “Unauthorized” behaviour.                             |
| **F12** | `features/log-sheets/log-sheet-locking.ts`           |    39 |  🟡  | **Locking rules.** Converts status + locked flag + admin override into editability state. Used by F2 and covered by tests, but still central to preventing unintended edits on submitted/approved sheets.                                                |
| **A6**  | `[projectId]/components/log-sheet-form.tsx`          |   160 |  🟢  | **Create form.** Isolated to project-level dialog. Depends on F1/F3 and technicians list hook, but nothing else depends on it (besides A5 wrapper). UI-only with straightforward flow.                                                                   |
| **A10** | `[logSheetId]/components/chemical-usage-section.tsx` |   211 |  🟢  | **Leaf component.** Self-contained CRUD for chemicals within a log sheet. Uses external `chemicals` feature and is only consumed by A7.                                                                                                                  |
| **A11** | `[logSheetId]/components/mobile-entry-card.tsx`      |   201 |  🟢  | **Mobile leaf component.** Mobile-only entry display. Imports from A8, A9, F4 but only referenced by A7. Impact is limited to mobile layout/UX.                                                                                                          |
| **A14** | `hooks/use-log-sheet-detail-data.ts`                 |    35 |  🟢  | **Data fetcher.** Simple wrapper around `getLogSheetDetailAction`. Leaf hook used only by A7.                                                                                                                                                            |
| **A17** | `hooks/use-log-sheet-technicians.ts`                 |    19 |  🟢  | **Data fetcher.** Fetches user list for technicians/signers. Duplicates pattern from A6 but otherwise isolated. Leaf hook.                                                                                                                               |
| **F5**  | `components/log-sheet-header.tsx`                    |    75 |  🟢  | **Print header.** Stateless presentational component. Only consumed by F6. No business rules.                                                                                                                                                            |
| **F7**  | `components/signature-section.tsx`                   |   144 |  🟢  | **Signature UI wrapper.** Handles dialog, canvas integration, and calls `saveLogSheetSignatureAction` with toasts. Only used by A7; behaviour is important but coupling is limited to a single page.                                                     |
| **F8**  | `components/signature-pad.tsx`                       |   197 |  🟢  | **Canvas widget.** Pure client-side drawing logic that emits a data URL. Only used by F7. Failure here affects UX of signing but not core persistence logic.                                                                                             |
| **A1**  | `page.tsx` (root)                                    |    63 |  🟢  | **List page.** Renders project table for log-sheet entry point. Depends on external `projects` feature. Leaf page.                                                                                                                                       |
| **A2**  | `components/project-columns.tsx`                     |    29 |  🟢  | **Column defs.** Stateless table column config. Only consumed by A1.                                                                                                                                                                                     |
| **A3**  | `[projectId]/page.tsx`                               |   136 |  🟢  | **Project log-sheet list page.** Standard CRUD list with dialog. Depends on F1/F3 but not reused by other modules.                                                                                                                                       |
| **A4**  | `[projectId]/components/columns.tsx`                 |    75 |  🟢  | **Column defs.** Contains duplicated `formatDate` and `TLogSheetRow` type but is only used by A3.                                                                                                                                                        |
| **A5**  | `[projectId]/components/log-sheet-dialog.tsx`        |    35 |  🟢  | **Dialog wrapper.** Thin CrudDialog shell around A6. Leaf component with no independent business logic.                                                                                                                                                  |

---

## Summary

| Risk Level | Count  | Files                                                                   |
| :--------: | :----: | ----------------------------------------------------------------------- |
|  🔴 HIGH   | **2**  | F1, F3                                                                  |
| 🟡 MEDIUM  | **15** | F2, F13, A7, A8, F4, A18, F6, A15, A13, A12, A16, A9, F9, F10, F11, F12 |
|   🟢 LOW   | **13** | A6, A10, A11, A14, A17, F5, F7, F8, A1, A2, A3, A4, A5                  |

> **Interpretation:** Refactoring reduced HIGH-risk files from 4 to 2. `service.ts` (F2) and `page.tsx` (A7) downgraded to MEDIUM after extracting status/validation logic and UI components. New `log-sheet-status.service.ts` (F13) follows SRP. Remaining HIGH-risk files are `actions.ts` (F1) and `types.ts` (F3) — both are architectural hubs by design.
