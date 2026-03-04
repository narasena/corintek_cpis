# WBS Deep Scan: M-13 — Lab Analyses

## EP-008: Lab Analysis Tracking

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-008** | — | **Epic** | **Lab Analysis Tracking** | **—** | **—** | **—** | **Σ** |
| **US-008-001** | EP-008 | **User Story** | **As a technician, I want to record detailed lab analysis results for water quality monitoring** | **—** | **—** | **—** | **Σ** |
| AC-008-001 | US-008-001 | Acceptance Criteria | Detailed results tracking with dynamic columns and formal print layout | — | — | — | Σ |
| **WP-008-001** | AC-008-001 | **Work Package** | **Frontend (Lab Analysis UI)** | **—** | **—** | **—** | **Σ** |
| TK-008-001 | WP-008-001 | Task | LabAnalysisForm: Matrix state management, dynamic columns, and complex validation | 4 | 6 | 10 | 6.33 |
| TK-008-002 | WP-008-001 | Task | LabAnalysisPrint: A4 layout, CSS print rules, and limit calculation logic | 2 | 4 | 6 | 4.00 |
| TK-008-003 | WP-008-001 | Task | App Pages & Routing: [projectId] structure, history lists, and project selection | 1.5 | 3 | 5 | 3.08 |
| TK-008-004 | WP-008-001 | Task | Zod schemas and matrix type definitions for nested analysis entries | 0.5 | 1 | 2 | 1.08 |
| **WP-008-002** | AC-008-001 | **Work Package** | **Backend (Lab Analysis Logic)** | **—** | **—** | **—** | **Σ** |
| TK-008-005 | WP-008-002 | Task | Service Layer: Transactional sync for pivot entries (create/update) | 3 | 5 | 8 | 5.17 |
| TK-008-006 | WP-008-002 | Task | Server Actions: Wrapper logic, error handling, and response normalization | 1 | 2 | 3 | 2.00 |
| **WP-008-003** | AC-008-001 | **Work Package** | **Database (Prisma Schema)** | **—** | **—** | **—** | **Σ** |
| TK-008-007 | WP-008-003 | Task | Prisma Schema: Models, composite unique indexes, and relation definitions | 0.5 | 1.5 | 3 | 1.67 |
| **WP-008-004** | AC-008-001 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-008-008 | WP-008-004 | Task | Unit Tests: Validation of transactional column/entry sync logic | 2 | 4 | 6 | 4.00 |

## File Manifest

| File Path | Lines | Functions | Purpose |
| :--- | :--- | :--- | :--- |
| `prisma/schema/lab-analyses.prisma` | 66 | 3 Models | Database schema for pivot-style data. |
| `src/features/lab-analyses/types.ts` | 55 | 2 Schemas | Matrix entry validation schemas. |
| `src/features/lab-analyses/service.ts` | ~380 | 12 Fns | Transactional CRUD and sync logic. |
| `src/features/lab-analyses/actions.ts` | 26 | 2 Actions | Server action wrappers. |
| `src/features/lab-analyses/components/lab-analysis-form.tsx` | 470 | 1 Comp | Massive matrix entry form. |
| `src/features/lab-analyses/components/lab-analysis-print.tsx` | 255 | 1 Comp | A4 report layout with limits. |
| `src/app/(main)/lab-analyses/page.tsx` | 42 | 1 Page | Project selection list. |
| `src/app/(main)/lab-analyses/[projectId]/page.tsx` | 24 | 1 Page | Analysis history list. |

## Confidence Assessment

- **Confidence: 95% [🟢]**
- **Rationale**: Detailed reading of the core form and service logic confirms high complexity in dynamic column management. Estimates adjusted upwards from fast scan to reflect real matrix state handling.

## Cross-reference Fast Scan
- **Fast Scan Total**: 22.91 hrs
- **Deep Scan Total**: 27.33 hrs
- **Delta**: +4.42 hrs (Form complexity and unit tests for sync logic were under-estimated in fast scan)
