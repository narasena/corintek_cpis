# WBS Deep Scan: M-08 — Projects

## EP-004: Project Management

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-004** | — | **Epic** | **Project Management** | **—** | **—** | **—** | **Σ** |
| **US-004-001** | EP-004 | **User Story** | **As an admin, I want to manage projects so I can track contracts and assignments** | **—** | **—** | **—** | **Σ** |
| **AC-004-001** | US-004-001 | **Acceptance Criteria** | **Project CRUD with status, type, and client linkage** | **—** | **—** | **—** | **Σ** |
| **WP-004-001** | AC-004-001 | **Work Package** | **Frontend (UI/UX)** | **—** | **—** | **—** | **Σ** |
| TK-004-001 | WP-004-001 | Task | Projects list page with DataTable and layout (page.tsx, layout.tsx, columns.tsx) | 2 | 4 | 7 | 4.17 |
| TK-004-002 | WP-004-001 | Task | ProjectForm orchestration and Meta section (project-form.tsx, project-meta-section.tsx) | 3 | 5 | 8 | 5.17 |
| TK-004-003 | WP-004-001 | Task | Project assignments UI (user selection, role mapping, async save) | 2 | 4 | 6 | 4.00 |
| TK-004-004 | WP-004-001 | Task | Parameter overrides UI (tabbed table, individual row updates, multi-limit support) | 3 | 6 | 10 | 6.17 |
| TK-004-005 | WP-004-001 | Task | Specialized selectors (ProjectParentSelect with client filtering, Type/Contract/Category selects) | 1 | 2 | 4 | 2.17 |
| **WP-004-002** | AC-004-001 | **Work Package** | **Backend (Logic & APIs)** | **—** | **—** | **—** | **Σ** |
| TK-004-006 | WP-004-002 | Task | Projects server actions (CRUD, Assignments, Overrides, revalidation logic) | 2 | 4 | 8 | 4.33 |
| TK-004-007 | WP-004-002 | Task | Projects service layer (600+ lines: dashboard cards, machine sync, complex transactions) | 3 | 7 | 12 | 7.17 |
| TK-004-008 | WP-004-002 | Task | Access Policy: RBAC and assignment-based filtering (isProjectScopedRole, buildProjectAccessWhere) | 1 | 2 | 4 | 2.17 |
| TK-004-009 | WP-004-002 | Task | Reporting Scope: recursive hierarchy logic for Utama/Addendum grouping | 2 | 4 | 7 | 4.17 |
| TK-004-010 | WP-004-002 | Task | Project validation logic (Addendum constraints, client matching, status flow) | 1 | 2 | 4 | 2.17 |
| **WP-004-003** | AC-004-001 | **Work Package** | **Database** | **—** | **—** | **—** | **Σ** |
| TK-004-011 | WP-004-003 | Task | Project, ProjectAssignment, and ProjectParameterOverride models (schema.prisma) | 1 | 2 | 3 | 2.00 |
| **WP-004-004** | AC-004-001 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-004-012 | WP-004-004 | Task | Unit tests for reporting scope, service logic, and project types | 2 | 4 | 7 | 4.17 |

### File Manifest — M-08: Projects

| # | File | Lines | Functions | Covered By | Complexity |
| :--- | :--- | ---: | ---: | :--- | :--- |
| 1 | `prisma/schema/projects.prisma` | 105 | - | TK-004-011 | Standard |
| 2 | `src/features/projects/types.ts` | 196 | - | TK-004-011 | Standard |
| 3 | `src/features/projects/service.ts` | 612 | 22 | TK-004-007 | 🔗 Integration-heavy |
| 4 | `src/features/projects/actions.ts` | 152 | 8 | TK-004-006 | Standard |
| 5 | `src/features/projects/reporting-scope.ts` | 92 | 3 | TK-004-009 | 📋 Business rules |
| 6 | `src/features/projects/access-policy.ts` | 58 | 2 | TK-004-008 | Standard |
| 7 | `src/features/projects/components/project-form.tsx` | 115 | 1 | TK-004-002 | Standard |
| 8 | `src/features/projects/components/project-meta-section.tsx` | 300 | 1 | TK-004-002 | Standard |
| 9 | `src/features/projects/components/project-assignments-section.tsx` | 208 | 2 | TK-004-003 | Standard |
| 10 | `src/features/projects/components/project-parameter-overrides-dialog.tsx` | 372 | 3 | TK-004-004 | ⚠️ Deceptively complex |
| 11 | `src/features/projects/components/project-parent-select.tsx` | 110 | 1 | TK-004-005 | Standard |
| 12 | `src/features/projects/components/project-dialog.tsx` | 50 | 1 | TK-004-001 | Standard |
| 13 | `src/app/(main)/projects/page.tsx` | 144 | 1 | TK-004-001 | Standard |
| 14 | `src/app/(main)/projects/components/columns.tsx` | 150 | 2 | TK-004-001 | Standard |
| 15 | `src/features/projects/reporting-scope.test.ts` | 150 | - | TK-004-012 | Standard |

### Confidence: 98%

**Justification:**
- Files scanned: 27/27 (100% of listed + discovered files)
- Functions covered: All critical service and component functions identified.
- Gaps: None known. The machine sync logic was analyzed and attributed to the project form orchestration.
- Cross-ref vs fast scan: Matched all fast scan tasks, refined estimates for service logic (TK-004-007) and overrides UI (TK-004-004) due to higher observed complexity.

**Status:** 🟢 High Confidence
