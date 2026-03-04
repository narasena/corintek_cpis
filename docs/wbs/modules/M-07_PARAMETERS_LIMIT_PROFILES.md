# WBS Deep Scan: M-07 — Parameters & Limit Profiles → EP-009

## File Manifest

| Path | Lines | Functions/Components | Purpose |
| :--- | :--- | :--- | :--- |
| `prisma/schema/parameters.prisma` | 46 | 0 | Defines `Parameter` model and enums. |
| `prisma/schema/parameter-limit-profiles.prisma` | 40 | 0 | Defines `ParameterLimitProfile` and `ParameterLimit` models. |
| `src/features/parameters/types.ts` | 134 | 0 | Zod schemas and TypeScript types for parameters. |
| `src/features/parameters/service.ts` | 108 | 5 | CRUD service for parameters with soft delete. |
| `src/features/parameters/limits-service.ts` | 234 | 6 | Complex logic for default limits, batch updates, and migration. |
| `src/features/parameters/actions.ts` | 212 | 8 | Server actions for parameters and limits. |
| `src/features/parameter-limit-profiles/types.ts` | 152 | 0 | Complex types and interfaces for limit profiles. |
| `src/features/parameter-limit-profiles/repository-prisma.ts` | 246 | 15 | Prisma repository implementation for limit profiles. |
| `src/features/parameter-limit-profiles/service.ts` | 314 | 12 | Business logic service for limit profiles using DI. |
| `src/features/parameter-limit-profiles/actions.ts` | 268 | 10 | Server actions for limit profiles using `ActionResult` helpers. |
| `src/features/parameter-limit-profiles/components/profiles-content.tsx` | 184 | 1 | UI for profile management tab. |
| `src/features/parameter-limit-profiles/components/parameter-limits-content.tsx` | 114 | 1 | UI for default limits management tab. |
| `src/features/parameter-limit-profiles/components/profile-form.tsx` | 142 | 1 | Form for limit profile metadata. |
| `src/features/parameter-limit-profiles/components/parameter-limit-dialog.tsx` | 86 | 1 | Dialog for individual parameter limit editing. |
| `src/features/parameters/components/parameter-form.tsx` | 212 | 1 | Complex form for parameter metadata. |
| `src/app/(main)/parameters/page.tsx` | 164 | 1 | Three-tab main management page. |
| `src/features/parameters/limits-service.test.ts` | 156 | 10 | Unit tests for limits logic. |

## Complexity Assessment

- **Dual Domain Architecture**: Parameters are distinct from Limit Profiles, but tightly coupled in the UI.
- **Repository Pattern**: Limit profiles use a formal repository pattern with dependency injection for better testability.
- **Migration Logic**: `limits-service.ts` includes logic to migrate limits when parameter IDs change but variable names stay the same.
- **Batch Operations**: Support for batch updating limits across multiple parameters.
- **Transaction Safety**: Service layer uses Prisma transactions for atomic batch operations.
- **Project Linkage**: Limit profiles are linked to projects, requiring reassignment logic during deletion.

## EP-009: Parameters & Limit Profiles

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| TK-009-001 | EP-009 | WP | Database | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-009-001-01 | TK-009-001 | Task | Define `Parameter` schema and categorization enums | 0.5 | 1.0 | 2.0 | 1.1 |
| TK-009-001-02 | TK-009-001 | Task | Define `ParameterLimitProfile` and `ParameterLimit` schema | 1.0 | 1.5 | 3.0 | 1.7 |
| TK-009-002 | EP-009 | WP | Backend (Parameters) | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-009-002-01 | TK-009-002 | Task | Develop Parameter CRUD Service (Soft delete, variableName validation) | 1.5 | 3.0 | 5.0 | 3.1 |
| TK-009-002-02 | TK-009-002 | Task | Implement Zod schemas and Type definitions for Parameters | 0.5 | 1.0 | 2.0 | 1.1 |
| TK-009-002-03 | TK-009-002 | Task | Parameter Server Actions with error handling for unique constraints | 1.0 | 2.0 | 4.0 | 2.2 |
| TK-009-003 | EP-009 | WP | Backend (Limit Profiles) | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-009-003-01 | TK-009-003 | Task | Implement Prisma Repository for Limit Profiles | 2.0 | 4.0 | 7.0 | 4.2 |
| TK-009-003-02 | TK-009-003 | Task | Develop Limit Profile Service (DI, Business logic, reassignment) | 3.0 | 5.0 | 9.0 | 5.3 |
| TK-009-003-03 | TK-009-003 | Task | Implement Default Limit Migration Logic and Batch Updates | 2.0 | 4.0 | 7.0 | 4.2 |
| TK-009-003-04 | TK-009-003 | Task | Server Actions for Profiles using `ActionResult` helpers | 1.5 | 3.0 | 5.0 | 3.1 |
| TK-009-004 | EP-009 | WP | Frontend | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-009-004-01 | TK-009-004 | Task | Parameters management page with Three-Tab system | 2.0 | 4.0 | 7.0 | 4.2 |
| TK-009-004-02 | TK-009-004 | Task | ParameterForm with dynamic categorization and variable naming | 2.0 | 4.0 | 6.0 | 4.0 |
| TK-009-004-03 | TK-009-004 | Task | Limit Profiles management UI (Lists, Stats, Selector) | 2.0 | 4.0 | 7.0 | 4.2 |
| TK-009-004-04 | TK-009-004 | Task | Individual and Batch Limit Editor Dialogs | 1.5 | 3.0 | 5.0 | 3.1 |
| TK-009-004-05 | TK-009-004 | Task | Column definitions for Parameters and Limits | 1.0 | 1.5 | 3.0 | 1.7 |
| TK-009-005 | EP-009 | WP | Testing & QA | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-009-005-01 | TK-009-005 | Task | Unit tests for Limit Profiles Service and Migration logic | 2.0 | 4.0 | 7.0 | 4.2 |
| TK-009-005-02 | TK-009-005 | Task | Integration tests for Parameter CRUD and uniqueness | 1.0 | 2.0 | 4.0 | 2.2 |

**Σ EP-009: 49.6 hrs** (Estimated based on PERT mid-level developer efficiency)

## Confidence Assessment

- [x] Every file from the checklist has ≥ 1 Task
- [x] All Task rows have O, L, P, E values
- [x] E = (O + 4L + P) / 6 for each Task
- [x] IDs are sequential, no gaps, no cross-epic leaks
- [x] No fabricated features
- [x] No duplicate work with other Epics

**Confidence: 100% 🟢**
The module is one of the more architecturally complex master data sections. The deep scan revealed significant complexity in the Limit Profiles service layer (DI and Repository pattern) which justifies the ~50hr estimate.
