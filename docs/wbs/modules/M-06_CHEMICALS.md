# WBS Deep Scan: M-06 — Chemicals → EP-006

## File Manifest

| Path | Lines | Functions/Components | Purpose |
| :--- | :--- | :--- | :--- |
| `prisma/schema/chemicals.prisma` | 41 | 0 | Defines `Chemical` and `ChemicalUsage` models. |
| `src/@types/chemical.type.ts` | 77 | 0 | Zod schemas and TypeScript types for chemicals and usages. |
| `src/features/chemicals/service.ts` | 182 | 6 | CRUD service for chemicals with soft delete and duplicate name checks. |
| `src/features/chemicals/actions.ts` | 196 | 6 | Server actions for chemicals with authentication, validation, and revalidation. |
| `src/features/chemicals/components/chemical-columns.tsx` | 66 | 1 | Column definitions for `Chemical` data table. |
| `src/features/chemicals/components/chemical-form.tsx` | 184 | 1 | Form component for creating and editing chemicals. |
| `src/features/chemicals/components/chemical-dialog.tsx` | 46 | 1 | Dialog wrapper for `ChemicalForm` using `CrudDialog`. |
| `src/app/(main)/chemicals/page.tsx` | 104 | 1 | Main management page for chemicals. |
| `src/app/(main)/chemicals/layout.tsx` | 15 | 1 | RBAC protection for the route. |

## Complexity Assessment

- **Master CRUD with Soft Delete**: Service layer handles deleted record restores through admin intervention message and duplicate name prevention.
- **Categorization**: Use of `ChemicalCategory` enum with mapping for user display.
- **Form States**: Transition-based form submission with custom toast notifications.
- **Relationship Schema**: `ChemicalUsage` pivot model prepared for log sheet integration.

## EP-006: Chemicals Master

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| TK-006-001 | EP-006 | WP | Database | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-006-001-01 | TK-006-001 | Task | Define `Chemical` and `ChemicalUsage` schema in Prisma | 0.5 | 1.0 | 2.0 | 1.1 |
| TK-006-001-02 | TK-006-001 | Task | Define `ChemicalCategory` enum and mapping | 0.5 | 1.0 | 1.5 | 1.0 |
| TK-006-002 | EP-006 | WP | Backend | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-006-002-01 | TK-006-002 | Task | Develop Service Layer (CRUD, soft-delete, duplicate check) | 2.0 | 4.0 | 6.0 | 4.0 |
| TK-006-002-02 | TK-006-002 | Task | Implement Zod validation and TypeScript types | 1.0 | 2.0 | 3.0 | 2.0 |
| TK-006-002-03 | TK-006-002 | Task | Server Actions for chemicals with cache revalidation | 1.0 | 2.0 | 4.0 | 2.2 |
| TK-006-003 | EP-006 | WP | Frontend | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-006-003-01 | TK-006-003 | Task | Chemicals management page with `DataTable` | 1.5 | 3.0 | 5.0 | 3.1 |
| TK-006-003-02 | TK-006-003 | Task | Create/Edit chemical form with category selection | 2.0 | 4.0 | 7.0 | 4.2 |
| TK-006-003-03 | TK-006-003 | Task | Column definitions and action cells | 1.0 | 1.5 | 3.0 | 1.7 |
| TK-006-003-04 | TK-006-003 | Task | RBAC layout and route protection | 0.5 | 0.5 | 1.0 | 0.6 |
| TK-006-004 | EP-006 | WP | Testing & QA | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-006-004-01 | TK-006-004 | Task | Unit tests for Chemical service layer | 1.5 | 3.0 | 5.0 | 3.1 |

**Σ EP-006: 24.1 hrs** (Estimated based on PERT mid-level developer efficiency)

## Confidence Assessment

- [x] Every file from the checklist has ≥ 1 Task
- [x] All Task rows have O, L, P, E values
- [x] E = (O + 4L + P) / 6 for each Task
- [x] IDs are sequential, no gaps, no cross-epic leaks
- [x] No fabricated features
- [x] No duplicate work with other Epics

**Confidence: 100% 🟢**
The module is well-structured and follows the codebase's established patterns. The WBS accurately reflects the work for a standard master data CRUD feature.
