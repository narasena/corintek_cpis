# WBS Deep Scan: M-05 — Clients

## EP-003: Client Management

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-003** | — | **Epic** | **Client Management** | **—** | **—** | **—** | **Σ** |
| **US-003-001** | EP-003 | **User Story** | **As an admin, I want to manage clients so I can associate them with projects** | **—** | **—** | **—** | **Σ** |
| AC-003-001 | US-003-001 | Acceptance Criteria | Standard Master Data CRUD with DataTable and Form | — | — | — | Σ |
| **WP-003-001** | AC-003-001 | **Work Package** | **Frontend (UI/UX)** | **—** | **—** | **—** | **Σ** |
| TK-003-001 | WP-003-001 | Task | Client list page with DataTable integration (src/app/(main)/clients/page.tsx) | 1.5 | 3 | 5 | 3.08 |
| TK-003-002 | WP-003-001 | Task | Client data columns with ActionCell and truncate logic | 1 | 2 | 3 | 2.00 |
| TK-003-003 | WP-003-001 | Task | ClientForm with Zod validation (Create/Edit mode) | 2 | 4 | 7 | 4.17 |
| TK-003-004 | WP-003-001 | Task | ClientDialog wrapper with CrudDialog integration | 0.5 | 1 | 2 | 1.08 |
| **WP-003-002** | AC-003-001 | **Work Package** | **Backend (Logic & APIs)** | **—** | **—** | **—** | **Σ** |
| TK-003-005 | WP-003-002 | Task | Client server actions (CRUD with revalidation) | 1.5 | 3 | 5 | 3.08 |
| TK-003-006 | WP-003-002 | Task | Client service layer with uniqueness & RBAC checks | 2 | 4 | 7 | 4.17 |
| TK-003-007 | WP-003-002 | Task | Client types & Zod schemas definition (src/@types/client.type.ts) | 0.5 | 1 | 2 | 1.08 |
| TK-003-008 | WP-003-002 | Task | Client access control layout (src/app/(main)/clients/layout.tsx) | 0.5 | 1 | 1.5 | 1.00 |
| **WP-003-003** | AC-003-001 | **Work Package** | **Database** | **—** | **—** | **—** | **Σ** |
| TK-003-009 | WP-003-003 | Task | Client model schema design with soft-delete support | 0.5 | 1 | 2 | 1.08 |
| **WP-003-004** | AC-003-001 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-003-010 | WP-003-004 | Task | Unit tests for Client service and actions | 1.5 | 3 | 5 | 3.08 |

### File Manifest — M-05: Clients

| # | File | Lines | Functions | Covered By | Complexity |
| :--- | :--- | ---: | ---: | :--- | :--- |
| 1 | `prisma/schema/clients.prisma` | 17 | 1 | TK-003-009 | Standard |
| 2 | `src/@types/client.type.ts` | 73 | 4 | TK-003-007 | Standard |
| 3 | `src/features/clients/service.ts` | 154 | 5 | TK-003-006 | 📋 Business rules |
| 4 | `src/features/clients/actions.ts` | 165 | 5 | TK-003-005 | Standard |
| 5 | `src/features/clients/components/client-dialog.tsx` | 36 | 1 | TK-003-004 | Standard |
| 6 | `src/features/clients/components/client-form.tsx` | 174 | 1 | TK-003-003 | Standard |
| 7 | `src/app/(main)/clients/layout.tsx` | 15 | 1 | TK-003-008 | Standard |
| 8 | `src/app/(main)/clients/page.tsx` | 104 | 1 | TK-003-001 | Standard |
| 9 | `src/app/(main)/clients/components/client-columns.tsx` | 61 | 1 | TK-003-002 | Standard |

### Confidence: 100%

**Justification:**
- Files scanned: 9/9 (100%)
- All functions and logic paths accounted for.
- Pattern is standard across the codebase, allowing for high accuracy in estimation.
- Cross-ref vs fast scan: Matched all tasks, added specific tasks for types/schemas and layout.

**Status:** 🟢 High Confidence
