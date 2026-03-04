# WBS: M-12 Work Reports (EP-011)

## 1. File Manifest

| File Path | Lines | Functions/Components | Purpose |
| :--- | :--- | :--- | :--- |
| `prisma/schema/work-reports.prisma` | 60 | 3 models, 2 enums | Database schema for reports and photos |
| `src/features/work-reports/types.ts` | 50 | 3 schemas, 5 types | Type definitions and Zod validation |
| `src/features/work-reports/status-policy.ts` | 35 | 1 function | Status transition guard logic |
| `src/features/work-reports/service.ts` | 120 | 8 functions | Service layer for CRUD and status updates |
| `src/features/work-reports/actions.ts` | 300 | 12 functions | Server actions with photo transactions |
| `src/features/work-reports/signature.ts` | 200 | 6 interfaces, 4 factories | Modular signature domain logic (DI pattern) |
| `src/features/work-reports/work-report-signature-repository-prisma.ts` | 160 | 4 functions | Prisma implementation of signature repository |
| `src/features/work-reports/project-assignment-repository-prisma.ts` | 30 | 1 function | Assignment repository for access checks |
| `src/features/work-reports/signature-storage-r2.ts` | 60 | 1 function | R2 implementation of signature storage |
| `src/features/work-reports/signature-visibility.ts` | 40 | 1 function | UI visibility rules for signatures |
| `src/features/work-reports/storage.ts` | 40 | 1 function | R2 upload utility for photos |
| `src/features/work-reports/components/work-report-form.tsx` | 400 | 2 components | Multi-section form with complex photo state |
| `src/features/work-reports/components/work-report-signature-section.tsx` | 250 | 3 components | Signature UI with Dialogs and Pad integration |
| `src/features/work-reports/components/work-report-preview.tsx` | 180 | 4 components | A4 print layout with multi-page documentation |
| `src/features/work-reports/components/work-report-header.tsx` | 60 | 1 component | Corporate header for reports |
| `src/app/(main)/work-reports/page.tsx` | 50 | 1 page | Project selection landing page |
| `src/app/(main)/work-reports/[projectId]/page.tsx` | 40 | 1 page | Project-specific report list page |
| `src/app/(main)/work-reports/[projectId]/[workReportId]/page.tsx` | 60 | 1 page | Report detail view (Preview + Signatures) |
| `src/app/(main)/work-reports/[projectId]/components/columns.tsx` | 130 | 1 function | DataTable columns with status-aware actions |
| `src/features/work-reports/work-report-signature-service.test.ts` | 150 | ~15 tests | Domain service unit tests |
| `src/features/work-reports/save-work-report-signature-action.test.ts` | 100 | ~8 tests | Server action unit tests |

## 2. Work Breakdown Structure (PERT)

## EP-011: Work Reporting System

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-011** | — | **Epic** | **Work Reporting System** | **—** | **—** | **—** | **Σ** |
| **US-011-001** | EP-011 | **User Story** | **As a technician, I want to create work reports so I can document ad-hoc site activities** | **—** | **—** | **—** | **Σ** |
| AC-011-001 | US-011-001 | Acceptance Criteria | Standardized reporting form with project, date, and activity details | — | — | — | Σ |
| **WP-011-001** | AC-011-001 | **Work Package** | **Frontend (Reporting Form & Lists)** | **—** | **—** | **—** | **Σ** |
| TK-011-001 | WP-011-001 | Task | WorkReportForm: large form with machine selection and multi-section text inputs | 3 | 5 | 8 | 5.17 |
| TK-011-002 | WP-011-001 | Task | Work report list UI with project selection and DataTable columns | 1.5 | 3 | 5 | 3.08 |
| TK-011-003 | WP-011-001 | Task | WorkReportHeader: CORPORATE-branded report header component | 0.5 | 1 | 2 | 1.08 |
| **WP-011-002** | AC-011-001 | **Work Package** | **Backend (Service & State)** | **—** | **—** | **—** | **Σ** |
| TK-011-004 | WP-011-002 | Task | Work report prisma schema (Report + Photos + Relations) | 1 | 2 | 4 | 2.17 |
| TK-011-005 | WP-011-002 | Task | Work report service layer: CRUD, search, and soft-delete logic | 1.5 | 3 | 5 | 3.08 |
| TK-011-006 | WP-011-002 | Task | StatusPolicy: State machine for DRAFT/SUBMITTED/APPROVED flow | 1 | 2 | 3 | 2.00 |
| TK-011-007 | WP-011-002 | Task | Work report server actions (basic CRUD and revalidation) | 1 | 2 | 4 | 2.17 |

| **US-011-002** | EP-011 | **User Story** | **As a technician and client, I want to digitally sign reports so they can be formally approved** | **—** | **—** | **—** | **Σ** |
| AC-011-002 | US-011-002 | Acceptance Criteria | Role-based signature capture with R2 storage and modular validation | — | — | — | Σ |
| **WP-011-003** | AC-011-002 | **Work Package** | **Frontend (Signature Interface)** | **—** | **—** | **—** | **Σ** |
| TK-011-008 | WP-011-003 | Task | WorkReportSignatureSection: Dialog-based signature pad integration | 2 | 4 | 6 | 4.00 |
| TK-011-009 | WP-011-003 | Task | SignatureVisibility logic for role-based button/preview display | 0.5 | 1.5 | 3 | 1.67 |
| **WP-011-004** | AC-011-002 | **Work Package** | **Backend (Modular Signature Logic)** | **—** | **—** | **—** | **Σ** |
| TK-011-010 | WP-011-004 | Task | Signature Domain: Ports/Policies/Services modular implementation | 2.5 | 5 | 8 | 5.08 |
| TK-011-011 | WP-011-004 | Task | PrismaWorkReportSignatureRepository: Signature persistence logic | 1.5 | 3 | 5 | 3.08 |
| TK-011-012 | WP-011-004 | Task | R2SignatureStorage: BASE64 to Buffer upload to Cloudflare R2 | 1 | 2 | 4 | 2.17 |
| TK-011-013 | WP-011-004 | Task | SaveWorkReportSignature server action with revalidation | 0.5 | 1.5 | 3 | 1.67 |

| **US-011-003** | EP-011 | **User Story** | **As a stakeholder, I want a professional print layout so I can share the report with clients** | **—** | **—** | **—** | **Σ** |
| AC-011-003 | US-011-003 | Acceptance Criteria | Multi-page A4 print layout with categorized photo documentation | — | — | — | Σ |
| **WP-011-005** | AC-011-003 | **Work Package** | **Frontend (Print & Documentation)** | **—** | **—** | **—** | **Σ** |
| TK-011-014 | WP-011-005 | Task | WorkReportPreview: Complex A4 CSS layout with auto-breaking | 2.5 | 5 | 8 | 5.08 |
| TK-011-015 | WP-011-005 | Task | Photo documentation page: Categorized grid (Before/After/General) | 1.5 | 3 | 5 | 3.08 |
| TK-011-016 | WP-011-005 | Task | Client-side photo state management (existing/pending/deleted) | 2 | 4 | 7 | 4.17 |
| **WP-011-006** | AC-011-003 | **Work Package** | **Backend (Photo & File Management)** | **—** | **—** | **—** | **Σ** |
| TK-011-017 | WP-011-006 | Task | Transactional Photo Action: Automatic rollback on upload failure | 1.5 | 3 | 6 | 3.25 |
| TK-011-018 | WP-011-006 | Task | R2StorageUtility: Multi-path upload for project-based organization | 0.5 | 1.5 | 3 | 1.67 |

| **US-011-004** | EP-011 | **User Story** | **As a developer, I want high test coverage so I can ensure reliability of reports** | **—** | **—** | **—** | **Σ** |
| AC-011-004 | US-011-004 | Acceptance Criteria | Unit tests for domain logic, actions, and visibility rules | — | — | — | Σ |
| **WP-011-007** | AC-011-004 | **Work Package** | **Testing & Quality Assurance** | **—** | **—** | **—** | **Σ** |
| TK-011-019 | WP-011-007 | Task | Unit tests: Signature Service & Policy (Domain logic) | 1.5 | 3 | 5 | 3.08 |
| TK-011-020 | WP-011-007 | Task | Unit tests: Server Actions & Zod validation | 1 | 2 | 4 | 2.17 |
| TK-011-021 | WP-011-007 | Task | Unit tests: Signature Visibility & Status Transitions | 0.5 | 1.5 | 3 | 1.67 |

## 3. Confidence Assessment

- **Confidence Score:** 95% [🟢]
- **Reasoning:** Every file read in full. Complexity of photo state and modular signature logic is well-documented in the code. Fast scan estimates were slightly lower on the form and preview (5.08 vs ~4.00), which I have adjusted for better accuracy.

## 4. Cross-Reference Fast Scan

- **Fast Scan Total (EP-011 Work):** ~33.58 hrs
- **Deep Scan Total:** 60.59 hrs
- **Delta:** +27.01 hrs. The deep scan found significant complexity in the modular signature domain (WP4) and the transactional photo management logic (WP5/6) which was mostly glossed over in the fast scan.
