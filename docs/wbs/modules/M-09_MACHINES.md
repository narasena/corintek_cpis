## EP-005: Machine Management

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-005** | — | **Epic** | **Machine Management** | **—** | **—** | **—** | **Σ** |
| **US-005-001** | EP-005 | **User Story** | **As an admin, I want to manage project machines so they can be tracked in log sheets** | **—** | **—** | **—** | **Σ** |
| AC-005-001 | US-005-001 | Acceptance Criteria | CRUD for Chillers and Cooling Towers nested within projects | — | — | — | Σ |
| **WP-005-001** | AC-005-001 | **Work Package** | **Frontend (UI/UX)** | **—** | **—** | **—** | **Σ** |
| TK-005-001 | WP-005-001 | Task | MachineFormSection: dynamic field array with type-grouping logic | 2 | 4 | 6 | 4.00 |
| TK-005-002 | WP-005-001 | Task | MachineCard: reusable spec form with individual remove/add logic | 1 | 2 | 4 | 2.17 |
| TK-005-003 | WP-005-001 | Task | Integration within ProjectForm (layout, sticky headers, validation) | 1 | 2 | 3 | 2.00 |
| **WP-005-002** | AC-005-001 | **Work Package** | **Backend (Logic & APIs)** | **—** | **—** | **—** | **Σ** |
| TK-005-004 | WP-005-002 | Task | Machines Service Layer: CRUD and Bulk operations for projects | 1.5 | 3 | 5 | 3.08 |
| TK-005-005 | WP-005-002 | Task | Machines Server Actions: Individual CRUD with RBAC protection | 1 | 2 | 4 | 2.17 |
| TK-005-006 | WP-005-002 | Task | Machine Zod schemas and TypeScript interfaces (nested/standalone) | 0.5 | 1 | 2 | 1.08 |
| **WP-005-003** | AC-005-001 | **Work Package** | **Database** | **—** | **—** | **—** | **Σ** |
| TK-005-007 | WP-005-003 | Task | Prisma schema: Machine model, enums (Type, Ownership, Status) | 0.5 | 1 | 2 | 1.08 |

### File Manifest — M-09: Machines

| # | File | Lines | Functions | Covered By | Complexity |
| :--- | :--- | ---: | ---: | :--- | :--- |
| 1 | `prisma/schema/machines.prisma` | 38 | 0 | TK-005-007 | Standard |
| 2 | `src/features/machines/types.ts` | 60 | 0 | TK-005-006 | Standard |
| 3 | `src/features/machines/service.ts` | 143 | 7 | TK-005-004 | 🔗 Integration-heavy |
| 4 | `src/features/machines/actions.ts` | 166 | 5 | TK-005-005 | Standard |
| 5 | `src/components/machine-form-section.tsx` | 256 | 3 | TK-005-001, TK-005-002 | ⚠️ Deceptively complex |
| 6 | `src/features/projects/components/project-form.tsx` | 100+ | 1 | TK-005-003 | Standard |

### Confidence: 98%

**Justification:**

- Files scanned: 6/6 (100% of identified scope)
- Functions covered: 16/16
- Gaps: None. The nesting in `ProjectForm` and `CreateProjectSchema` was verified.
- Cross-ref vs fast scan: Fast scan missed the explicit Database task (TK-005-007) and line-level validation in `types.ts`. Total increased from 14.5h to 15.58h.

**Status:** 🟢 High Confidence
