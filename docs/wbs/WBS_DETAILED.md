# CPIS — Work Breakdown Structure (WBS)

> **Project:** Corintek Project Information System (CPIS)
> **Prepared by:** [Your Name]
> **Date:** 2026-03-03
> **Version:** Detailed (Task-Level)
> **Estimation Method:** PERT (Program Evaluation and Review Technique)
> **Rate Basis:** Mid-Level Developer — **Rp 85,000/hr**

---

## Legend

| Column     | Description                                      |
| :--------- | :----------------------------------------------- |
| ID         | Task identifier                                  |
| Parent     | Parent task ID                                   |
| Type       | Task type (Epic, User Story, Work Package, Task) |
| Item       | Task description                                 |
| O          | Optimistic estimate (hours)                      |
| L          | Likely estimate (hours)                          |
| P          | Pessimistic estimate (hours)                     |
| E          | PERT estimate (hours)                            |
| **Status** | **Complete / In Progress / Pending**             |

---

## Implementation Status Summary

| Status      | Count                                                 |
| :---------- | :---------------------------------------------------- |
| Complete    | ~95%                                                  |
| In Progress | 0                                                     |
| Pending     | Log Sheet Request Form, Excel Export, Master Settings |

---

## EP-001: Auth & Session

| ID         | Parent | Type                | Item                                                                                    |     O |     L |     P |     E |
| :--------- | :----- | :------------------ | :-------------------------------------------------------------------------------------- | ----: | ----: | ----: | ----: |
| **EP-001** | —      | **Epic**            | **Authentication & Session Management**                                                 | **—** | **—** | **—** | **Σ** |
| **US-001** | EP-001 | **User Story**      | **As an internal user, I want to log in so I can access the system**                    | **—** | **—** | **—** | **Σ** |
| AC-001     | US-001 | Acceptance Criteria | Email/Password Authentication with JWT                                                  |     — |     — |     — |     Σ |
| **WP-001** | AC-001 | **Work Package**    | **Frontend (UI/UX)**                                                                    |     — |     — |     — |     Σ |
| TK-001     | WP-001 | Task                | Login page layout with responsive branding (src/app/login/page.tsx)                     |     1 |     2 |     4 |  2.17 |
| TK-002     | WP-001 | Task                | Login form with validation & toast feedback (src/app/login/components/login-form.tsx)   |     2 |     4 |     6 |  4.00 |
| TK-003     | WP-001 | Task                | Integration with loginAction & loading states                                           |     1 |     2 |     3 |  2.00 |
| **WP-002** | AC-001 | **Work Package**    | **Backend (Logic & APIs)**                                                              |     — |     — |     — |     Σ |
| TK-004     | WP-002 | Task                | Server Actions: login (validate, set cookie) & logout (revalidate, redirect)            |     2 |     3 |     6 |  3.33 |
| TK-005     | WP-002 | Task                | Auth Service: authenticateUser (verify pass, check status) & getUserById                |     2 |     3 |     5 |  3.17 |
| TK-019     | WP-002 | Task                | JWT Edge Implementation: sign & verify using 'jose' (src/lib/jwt.ts)                    |     1 |     2 |     4 |  2.17 |
| TK-020     | WP-002 | Task                | Edge Middleware: route protection, public vs auth route logic                           |     2 |     4 |     7 |  4.17 |
| TK-021     | WP-002 | Task                | RBAC Engine: Resource mapping, role matrix, & nav filtering (src/lib/rbac.ts)           |     3 |     5 |     8 |  5.17 |
| TK-022     | WP-002 | Task                | Auth Helpers: getCurrentUserDetails, hash/compare password, requireActor                |     1 |     2 |     4 |  2.17 |
| **WP-003** | AC-001 | **Work Package**    | **Testing & QA**                                                                        |     — |     — |     — |     Σ |
| TK-023     | WP-003 | Task                | Unit Tests: Auth helpers & JWT verification (src/lib/auth-helpers.test.ts)              |     2 |     4 |     6 |  4.00 |
| TK-024     | WP-003 | Task                | Unit Tests: RBAC role matrix & access checks (src/lib/rbac.test.ts)                     |     2 |     3 |     5 |  3.17 |
| TK-025     | WP-003 | Task                | E2E Setup: Role-based test setup for Admin, Technician, Client (src/**tests**/e2e/auth) |     2 |     4 |     7 |  4.17 |

## EP-002: User Management

| ID             | Parent         | Type                | Item                                                                                                                   |     O |     L |     P |     E |
| :------------- | :------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- | ----: | ----: | ----: | ----: |
| **EP-002**     | —              | **Epic**            | **User Management**                                                                                                    | **—** | **—** | **—** | **Σ** |
| **US-002-001** | EP-002         | **User Story**      | **As an admin, I want to manage system users so I can control access to the platform**                                 | **—** | **—** | **—** | **Σ** |
| AC-002-001     | US-002-001     | Acceptance Criteria | User CRUD with roles, employment status, and soft-delete                                                               |     — |     — |     — |     Σ |
| **WP-002-001** | AC-002-001     | **Work Package**    | **Frontend (UI/UX)**                                                                                                   | **—** | **—** | **—** | **Σ** |
| TK-002-001     | **WP-002-001** | Task                | Users list page with DataTable and role-based badges (`src/app/(main)/users/page.tsx`)                                 |     2 |     3 |     5 |  3.17 |
| TK-002-002     | **WP-002-001** | Task                | UserForm: Create/Edit mode with role & status selection (`src/features/users/components/user-form.tsx`)                |     2 |     4 |     7 |  4.17 |
| TK-002-003     | **WP-002-001** | Task                | UserDialog: CrudDialog wrapper implementation (`src/features/users/components/user-dialog.tsx`)                        |   0.5 |     1 |     2 |  1.08 |
| **WP-002-002** | AC-002-001     | **Work Package**    | **Backend (Logic & APIs)**                                                                                             | **—** | **—** | **—** | **Σ** |
| TK-002-004     | **WP-002-002** | Task                | Users service: CRUD with soft-delete uniqueness logic (`src/features/users/service.ts`)                                |     2 |     4 |     8 |  4.33 |
| TK-002-005     | **WP-002-002** | Task                | Users server actions: CRUD, Revalidation, and RBAC enforcement (`src/features/users/actions.ts`)                       |   1.5 |     3 |     6 |  3.25 |
| TK-002-006     | **WP-002-002** | Task                | Admin service: Restore and Permanent delete utilities (`src/features/users/service-admin.ts`)                          |     1 |     2 |     4 |  2.17 |
| TK-002-007     | **WP-002-002** | Task                | Middleware & Layout protection: RBAC route guards (`src/app/(main)/users/layout.tsx`)                                  |   0.5 |     1 |     2 |  1.08 |
| **WP-002-003** | AC-002-001     | **Work Package**    | **Database**                                                                                                           | **—** | **—** | **—** | **Σ** |
| TK-002-008     | **WP-002-003** | Task                | User model schema: relations, enums, and soft-delete fields (`prisma/schema/users.prisma`)                             |   0.5 |   1.5 |     3 |  1.67 |
| **US-002-002** | EP-002         | **User Story**      | **As any user, I want to manage my profile so my personal information is up to date**                                  | **—** | **—** | **—** | **Σ** |
| AC-002-002     | US-002-002     | Acceptance Criteria | Profile editing with avatar upload to R2 storage                                                                       |     — |     — |     — |     Σ |
| **WP-002-004** | AC-002-002     | **Work Package**    | **Frontend (UI/UX)**                                                                                                   | **—** | **—** | **—** | **Σ** |
| TK-002-009     | **WP-002-004** | Task                | ProfileForm: Field validation and avatar preview/camera integration (`src/features/users/components/profile-form.tsx`) |     2 |     4 |     7 |  4.17 |
| **WP-002-005** | AC-002-002     | **Work Package**    | **Backend (Logic & APIs)**                                                                                             | **—** | **—** | **—** | **Σ** |
| TK-002-010     | **WP-002-005** | Task                | Profile server actions: Profile update and Avatar R2 upload integration (`src/features/users/actions.ts`)              |   1.5 |     3 |     5 |  3.08 |
| TK-002-011     | **WP-002-005** | Task                | Profile service: Current user data fetching and update logic (`src/features/users/service.ts`)                         |     1 |     2 |     3 |  2.00 |
| **WP-002-006** | AC-002-002     | **Work Package**    | **Testing & QA**                                                                                                       | **—** | **—** | **—** | **Σ** |
| TK-002-012     | **WP-002-006** | Task                | User service unit tests: Uniqueness, RBAC, and Soft-delete (`src/features/users/service.test.ts`)                      |   1.5 |     3 |     5 |  3.08 |
| TK-002-013     | **WP-002-006** | Task                | User actions unit tests: Validation and R2 integration mocks (`src/features/users/actions.test.ts`)                    |   1.5 |     3 |     5 |  3.08 |
| **WP-002-007** | AC-002-002     | **Work Package**    | **Testing & QA**                                                                                                       | **—** | **—** | **—** | **Σ** |
| TK-002-014     | **WP-002-007** | Task                | Users server actions unit tests (actions.test.ts)                                                                      |     2 |     4 |     6 |  4.00 |
| TK-002-015     | **WP-002-007** | Task                | Users service layer unit tests (service.test.ts)                                                                       |     2 |     4 |     6 |  4.00 |

## EP-003: Client Management

| ID             | Parent         | Type                | Item                                                                            |     O |     L |     P |     E |
| :------------- | :------------- | :------------------ | :------------------------------------------------------------------------------ | ----: | ----: | ----: | ----: |
| **EP-003**     | —              | **Epic**            | **Client Management**                                                           | **—** | **—** | **—** | **Σ** |
| **US-003-001** | EP-003         | **User Story**      | **As an admin, I want to manage clients so I can associate them with projects** | **—** | **—** | **—** | **Σ** |
| AC-003-001     | US-003-001     | Acceptance Criteria | Standard Master Data CRUD with DataTable and Form                               |     — |     — |     — |     Σ |
| **WP-003-001** | AC-003-001     | **Work Package**    | **Frontend (UI/UX)**                                                            | **—** | **—** | **—** | **Σ** |
| TK-003-001     | **WP-003-001** | Task                | Client list page with DataTable integration (src/app/(main)/clients/page.tsx)   |   1.5 |     3 |     5 |  3.08 |
| TK-003-002     | **WP-003-001** | Task                | Client data columns with ActionCell and truncate logic                          |     1 |     2 |     3 |  2.00 |
| TK-003-003     | **WP-003-001** | Task                | ClientForm with Zod validation (Create/Edit mode)                               |     2 |     4 |     7 |  4.17 |
| TK-003-004     | **WP-003-001** | Task                | ClientDialog wrapper with CrudDialog integration                                |   0.5 |     1 |     2 |  1.08 |
| **WP-003-002** | AC-003-001     | **Work Package**    | **Backend (Logic & APIs)**                                                      | **—** | **—** | **—** | **Σ** |
| TK-003-005     | **WP-003-002** | Task                | Client server actions (CRUD with revalidation)                                  |   1.5 |     3 |     5 |  3.08 |
| TK-003-006     | **WP-003-002** | Task                | Client service layer with uniqueness & RBAC checks                              |     2 |     4 |     7 |  4.17 |
| TK-003-007     | **WP-003-002** | Task                | Client types & Zod schemas definition (src/@types/client.type.ts)               |   0.5 |     1 |     2 |  1.08 |
| TK-003-008     | **WP-003-002** | Task                | Client access control layout (src/app/(main)/clients/layout.tsx)                |   0.5 |     1 |   1.5 |  1.00 |
| **WP-003-003** | AC-003-001     | **Work Package**    | **Database**                                                                    | **—** | **—** | **—** | **Σ** |
| TK-003-009     | **WP-003-003** | Task                | Client model schema design with soft-delete support                             |   0.5 |     1 |     2 |  1.08 |
| **WP-003-004** | AC-003-001     | **Work Package**    | **Testing & QA**                                                                | **—** | **—** | **—** | **Σ** |
| TK-003-010     | **WP-003-004** | Task                | Unit tests for Client service and actions                                       |   1.5 |     3 |     5 |  3.08 |

## EP-004: Project Management

| ID             | Parent         | Type                    | Item                                                                                              |     O |     L |     P |     E |
| :------------- | :------------- | :---------------------- | :------------------------------------------------------------------------------------------------ | ----: | ----: | ----: | ----: |
| **EP-004**     | —              | **Epic**                | **Project Management**                                                                            | **—** | **—** | **—** | **Σ** |
| **US-004-001** | EP-004         | **User Story**          | **As an admin, I want to manage projects so I can track contracts and assignments**               | **—** | **—** | **—** | **Σ** |
| AC-004-001     | US-004-001     | **Acceptance Criteria** | **Project CRUD with status, type, and client linkage**                                            | **—** | **—** | **—** | **Σ** |
| **WP-004-001** | AC-004-001     | **Work Package**        | **Frontend (UI/UX)**                                                                              | **—** | **—** | **—** | **Σ** |
| TK-004-001     | **WP-004-001** | Task                    | Projects list page with DataTable and layout (page.tsx, layout.tsx, columns.tsx)                  |     2 |     4 |     7 |  4.17 |
| TK-004-002     | **WP-004-001** | Task                    | ProjectForm orchestration and Meta section (project-form.tsx, project-meta-section.tsx)           |     3 |     5 |     8 |  5.17 |
| TK-004-003     | **WP-004-001** | Task                    | Project assignments UI (user selection, role mapping, async save)                                 |     2 |     4 |     6 |  4.00 |
| TK-004-004     | **WP-004-001** | Task                    | Parameter overrides UI (tabbed table, individual row updates, multi-limit support)                |     3 |     6 |    10 |  6.17 |
| TK-004-005     | **WP-004-001** | Task                    | Specialized selectors (ProjectParentSelect with client filtering, Type/Contract/Category selects) |     1 |     2 |     4 |  2.17 |
| **WP-004-002** | AC-004-001     | **Work Package**        | **Backend (Logic & APIs)**                                                                        | **—** | **—** | **—** | **Σ** |
| TK-004-006     | **WP-004-002** | Task                    | Projects server actions (CRUD, Assignments, Overrides, revalidation logic)                        |     2 |     4 |     8 |  4.33 |
| TK-004-007     | **WP-004-002** | Task                    | Projects service layer (600+ lines: dashboard cards, machine sync, complex transactions)          |     3 |     7 |    12 |  7.17 |
| TK-004-008     | **WP-004-002** | Task                    | Access Policy: RBAC and assignment-based filtering (isProjectScopedRole, buildProjectAccessWhere) |     1 |     2 |     4 |  2.17 |
| TK-004-009     | **WP-004-002** | Task                    | Reporting Scope: recursive hierarchy logic for Utama/Addendum grouping                            |     2 |     4 |     7 |  4.17 |
| TK-004-010     | **WP-004-002** | Task                    | Project validation logic (Addendum constraints, client matching, status flow)                     |     1 |     2 |     4 |  2.17 |
| **WP-004-003** | AC-004-001     | **Work Package**        | **Database**                                                                                      | **—** | **—** | **—** | **Σ** |
| TK-004-011     | **WP-004-003** | Task                    | Project, ProjectAssignment, and ProjectParameterOverride models (schema.prisma)                   |     1 |     2 |     3 |  2.00 |
| **WP-004-004** | AC-004-001     | **Work Package**        | **Testing & QA**                                                                                  | **—** | **—** | **—** | **Σ** |
| TK-004-012     | **WP-004-004** | Task                    | Unit tests for reporting scope, service logic, and project types                                  |     2 |     4 |     7 |  4.17 |
| **WP-004-005** | AC-004-001     | **Work Package**        | **Testing & QA**                                                                                  | **—** | **—** | **—** | **Σ** |
| TK-004-013     | **WP-004-005** | Task                    | Project Types & Reporting Scope unit tests                                                        |     2 |     4 |     7 |  4.17 |

## EP-005: Machine Management

| ID             | Parent         | Type                | Item                                                                                    |     O |     L |     P |     E |
| :------------- | :------------- | :------------------ | :-------------------------------------------------------------------------------------- | ----: | ----: | ----: | ----: |
| **EP-005**     | —              | **Epic**            | **Machine Management**                                                                  | **—** | **—** | **—** | **Σ** |
| **US-005-001** | EP-005         | **User Story**      | **As an admin, I want to manage project machines so they can be tracked in log sheets** | **—** | **—** | **—** | **Σ** |
| AC-005-001     | US-005-001     | Acceptance Criteria | CRUD for Chillers and Cooling Towers nested within projects                             |     — |     — |     — |     Σ |
| **WP-005-001** | AC-005-001     | **Work Package**    | **Frontend (UI/UX)**                                                                    | **—** | **—** | **—** | **Σ** |
| TK-005-001     | **WP-005-001** | Task                | MachineFormSection: dynamic field array with type-grouping logic                        |     2 |     4 |     6 |  4.00 |
| TK-005-002     | **WP-005-001** | Task                | MachineCard: reusable spec form with individual remove/add logic                        |     1 |     2 |     4 |  2.17 |
| TK-005-003     | **WP-005-001** | Task                | Integration within ProjectForm (layout, sticky headers, validation)                     |     1 |     2 |     3 |  2.00 |
| **WP-005-002** | AC-005-001     | **Work Package**    | **Backend (Logic & APIs)**                                                              | **—** | **—** | **—** | **Σ** |
| TK-005-004     | **WP-005-002** | Task                | Machines Service Layer: CRUD and Bulk operations for projects                           |   1.5 |     3 |     5 |  3.08 |
| TK-005-005     | **WP-005-002** | Task                | Machines Server Actions: Individual CRUD with RBAC protection                           |     1 |     2 |     4 |  2.17 |
| TK-005-006     | **WP-005-002** | Task                | Machine Zod schemas and TypeScript interfaces (nested/standalone)                       |   0.5 |     1 |     2 |  1.08 |
| **WP-005-003** | AC-005-001     | **Work Package**    | **Database**                                                                            | **—** | **—** | **—** | **Σ** |
| TK-005-007     | **WP-005-003** | Task                | Prisma schema: Machine model, enums (Type, Ownership, Status)                           |   0.5 |     1 |     2 |  1.08 |

## EP-006: Chemical Management

| ID         | Parent         | Type     | Item                                                       |     O |     L |     P |     E |
| :--------- | :------------- | :------- | :--------------------------------------------------------- | ----: | ----: | ----: | ----: |
| **EP-006** | —              | **Epic** | **Chemical Management**                                    | **—** | **—** | **—** | **Σ** |
| TK-006-001 | EP-006         | WP       | Database                                                   | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-006-001 | **WP-006-000** | Task     | Define `Chemical` and `ChemicalUsage` schema in Prisma     |   0.5 |   1.0 |   2.0 |   1.1 |
| TK-006-002 | **WP-006-000** | Task     | Define `ChemicalCategory` enum and mapping                 |   0.5 |   1.0 |   1.5 |   1.0 |
| TK-006-002 | EP-006         | WP       | Backend                                                    | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-006-003 | **WP-006-000** | Task     | Develop Service Layer (CRUD, soft-delete, duplicate check) |   2.0 |   4.0 |   6.0 |   4.0 |
| TK-006-004 | **WP-006-000** | Task     | Implement Zod validation and TypeScript types              |   1.0 |   2.0 |   3.0 |   2.0 |
| TK-006-005 | **WP-006-000** | Task     | Server Actions for chemicals with cache revalidation       |   1.0 |   2.0 |   4.0 |   2.2 |
| TK-006-003 | EP-006         | WP       | Frontend                                                   | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-006-006 | **WP-006-000** | Task     | Chemicals management page with `DataTable`                 |   1.5 |   3.0 |   5.0 |   3.1 |
| TK-006-007 | **WP-006-000** | Task     | Create/Edit chemical form with category selection          |   2.0 |   4.0 |   7.0 |   4.2 |
| TK-006-008 | **WP-006-000** | Task     | Column definitions and action cells                        |   1.0 |   1.5 |   3.0 |   1.7 |
| TK-006-009 | **WP-006-000** | Task     | RBAC layout and route protection                           |   0.5 |   0.5 |   1.0 |   0.6 |
| TK-006-004 | EP-006         | WP       | Testing & QA                                               | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-006-010 | **WP-006-000** | Task     | Unit tests for Chemical service layer                      |   1.5 |   3.0 |   5.0 |   3.1 |

## EP-007: Attendance & Absence

| ID             | Parent         | Type             | Item                                                                             |     O |     L |     P |           E |
| :------------- | :------------- | :--------------- | :------------------------------------------------------------------------------- | ----: | ----: | ----: | ----------: |
| **EP-007**     | —              | **Epic**         | **Attendance & Absence**                                                         | **—** | **—** | **—** |       **Σ** |
| **US-007-001** | EP-007         | **User Story**   | **As a technician, I want to clock in/out with a photo to record my attendance** | **—** | **—** | **—** | **Σ 15.00** |
| AC-007-001     | US-007-001     | Acceptance       | Capture photo from camera or gallery (square crop)                               |     — |     — |     — |           — |
| AC-007-002     | US-007-001     | Acceptance       | Auto-calculate total hours worked upon clock-out                                 |     — |     — |     — |           — |
| AC-007-003     | US-007-001     | Acceptance       | Restrict to one entry per user per day (`dateLocal`)                             |     — |     — |     — |           — |
| TK-007-001     | US-007-001     | Database         | Prisma schema for Attendance & unique constraints                                |   0.5 |   1.5 |   3.0 |        1.58 |
| TK-007-002     | US-007-001     | Backend          | Service layer (clock-in/out logic, hour calculation)                             |   2.0 |   4.0 |   7.0 |        4.17 |
| TK-007-003     | US-007-001     | Backend          | Server Actions (R2 photo upload, cache revalidation)                             |   1.5 |   3.0 |   5.0 |        3.08 |
| TK-007-004     | US-007-001     | Frontend         | Technician Attendance UI (Camera integration, status state)                      |   2.0 |   6.0 |  10.0 |        6.17 |
| **US-007-002** | EP-007         | **User Story**   | **As an admin, I want to review technician attendance and export logs**          | **—** | **—** | **—** |  **Σ 4.08** |
| AC-007-004     | US-007-002     | Acceptance       | Filter attendance by date range and technician                                   |     — |     — |     — |           — |
| AC-007-005     | US-007-002     | Acceptance       | Export filtered list to CSV format with BOM support                              |     — |     — |     — |           — |
| TK-007-005     | US-007-002     | Backend          | List attendance query & CSV export logic (service.ts)                            |   1.5 |   3.0 |   5.0 |        3.08 |
| TK-007-006     | US-007-002     | Frontend         | Admin Dashboard UI (DataTable, filter controls, CSV trigger)                     |   1.5 |   4.0 |   7.0 |        4.08 |
| **WP-007-001** | AC-007-000     | **Work Package** | **Testing & QA**                                                                 | **—** | **—** | **—** |  **Σ 4.08** |
| TK-007-001     | **WP-007-001** | Testing          | Characterization tests for hour calculation & photo upload                       |   2.0 |   4.0 |   7.0 |        4.08 |

## EP-008: Lab Analysis

| ID             | Parent         | Type                | Item                                                                                             |     O |     L |     P |     E |
| :------------- | :------------- | :------------------ | :----------------------------------------------------------------------------------------------- | ----: | ----: | ----: | ----: |
| **EP-008**     | —              | **Epic**            | **Lab Analysis**                                                                                 | **—** | **—** | **—** | **Σ** |
| **US-008-001** | EP-008         | **User Story**      | **As a technician, I want to record detailed lab analysis results for water quality monitoring** | **—** | **—** | **—** | **Σ** |
| AC-008-001     | US-008-001     | Acceptance Criteria | Detailed results tracking with dynamic columns and formal print layout                           |     — |     — |     — |     Σ |
| **WP-008-001** | AC-008-001     | **Work Package**    | **Frontend (Lab Analysis UI)**                                                                   | **—** | **—** | **—** | **Σ** |
| TK-008-001     | **WP-008-001** | Task                | LabAnalysisForm: Matrix state management, dynamic columns, and complex validation                |     4 |     6 |    10 |  6.33 |
| TK-008-002     | **WP-008-001** | Task                | LabAnalysisPrint: A4 layout, CSS print rules, and limit calculation logic                        |     2 |     4 |     6 |  4.00 |
| TK-008-003     | **WP-008-001** | Task                | App Pages & Routing: [projectId] structure, history lists, and project selection                 |   1.5 |     3 |     5 |  3.08 |
| TK-008-004     | **WP-008-001** | Task                | Zod schemas and matrix type definitions for nested analysis entries                              |   0.5 |     1 |     2 |  1.08 |
| **WP-008-002** | AC-008-001     | **Work Package**    | **Backend (Lab Analysis Logic)**                                                                 | **—** | **—** | **—** | **Σ** |
| TK-008-005     | **WP-008-002** | Task                | Service Layer: Transactional sync for pivot entries (create/update)                              |     3 |     5 |     8 |  5.17 |
| TK-008-006     | **WP-008-002** | Task                | Server Actions: Wrapper logic, error handling, and response normalization                        |     1 |     2 |     3 |  2.00 |
| **WP-008-003** | AC-008-001     | **Work Package**    | **Database (Prisma Schema)**                                                                     | **—** | **—** | **—** | **Σ** |
| TK-008-007     | **WP-008-003** | Task                | Prisma Schema: Models, composite unique indexes, and relation definitions                        |   0.5 |   1.5 |     3 |  1.67 |
| **WP-008-004** | AC-008-001     | **Work Package**    | **Testing & QA**                                                                                 | **—** | **—** | **—** | **Σ** |
| TK-008-008     | **WP-008-004** | Task                | Unit Tests: Validation of transactional column/entry sync logic                                  |     2 |     4 |     6 |  4.00 |

## EP-009: Parameters & Profiles

| ID             | Parent         | Type             | Item                                                                  |     O |     L |     P |     E |
| :------------- | :------------- | :--------------- | :-------------------------------------------------------------------- | ----: | ----: | ----: | ----: |
| **EP-009**     | —              | **Epic**         | **Parameters & Profiles**                                             | **—** | **—** | **—** | **Σ** |
| TK-009-001     | EP-009         | WP               | Database                                                              | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-009-001     | **WP-009-000** | Task             | Define `Parameter` schema and categorization enums                    |   0.5 |   1.0 |   2.0 |   1.1 |
| TK-009-002     | **WP-009-000** | Task             | Define `ParameterLimitProfile` and `ParameterLimit` schema            |   1.0 |   1.5 |   3.0 |   1.7 |
| TK-009-002     | EP-009         | WP               | Backend (Parameters)                                                  | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-009-003     | **WP-009-000** | Task             | Develop Parameter CRUD Service (Soft delete, variableName validation) |   1.5 |   3.0 |   5.0 |   3.1 |
| TK-009-004     | **WP-009-000** | Task             | Implement Zod schemas and Type definitions for Parameters             |   0.5 |   1.0 |   2.0 |   1.1 |
| TK-009-005     | **WP-009-000** | Task             | Parameter Server Actions with error handling for unique constraints   |   1.0 |   2.0 |   4.0 |   2.2 |
| TK-009-003     | EP-009         | WP               | Backend (Limit Profiles)                                              | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-009-006     | **WP-009-000** | Task             | Implement Prisma Repository for Limit Profiles                        |   2.0 |   4.0 |   7.0 |   4.2 |
| TK-009-007     | **WP-009-000** | Task             | Develop Limit Profile Service (DI, Business logic, reassignment)      |   3.0 |   5.0 |   9.0 |   5.3 |
| TK-009-008     | **WP-009-000** | Task             | Implement Default Limit Migration Logic and Batch Updates             |   2.0 |   4.0 |   7.0 |   4.2 |
| TK-009-009     | **WP-009-000** | Task             | Server Actions for Profiles using `ActionResult` helpers              |   1.5 |   3.0 |   5.0 |   3.1 |
| TK-009-004     | EP-009         | WP               | Frontend                                                              | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-009-010     | **WP-009-000** | Task             | Parameters management page with Three-Tab system                      |   2.0 |   4.0 |   7.0 |   4.2 |
| TK-009-011     | **WP-009-000** | Task             | ParameterForm with dynamic categorization and variable naming         |   2.0 |   4.0 |   6.0 |   4.0 |
| TK-009-012     | **WP-009-000** | Task             | Limit Profiles management UI (Lists, Stats, Selector)                 |   2.0 |   4.0 |   7.0 |   4.2 |
| TK-009-013     | **WP-009-000** | Task             | Individual and Batch Limit Editor Dialogs                             |   1.5 |   3.0 |   5.0 |   3.1 |
| TK-009-014     | **WP-009-000** | Task             | Column definitions for Parameters and Limits                          |   1.0 |   1.5 |   3.0 |   1.7 |
| TK-009-005     | EP-009         | WP               | Testing & QA                                                          | **Σ** | **Σ** | **Σ** | **Σ** |
| TK-009-015     | **WP-009-000** | Task             | Unit tests for Limit Profiles Service and Migration logic             |   2.0 |   4.0 |   7.0 |   4.2 |
| TK-009-016     | **WP-009-000** | Task             | Integration tests for Parameter CRUD and uniqueness                   |   1.0 |   2.0 |   4.0 |   2.2 |
| **WP-009-001** | AC-009-000     | **Work Package** | **Testing & QA**                                                      | **—** | **—** | **—** | **Σ** |
| TK-009-017     | **WP-009-001** | Task             | Parameter limit validation logic and utility tests                    |     1 |     2 |     4 |  2.17 |

## EP-010: Log Sheet System

| ID             | Parent         | Type                | Item                                                                                                               |     O |     L |     P |     E |
| :------------- | :------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- | ----: | ----: | ----: | ----: |
| **EP-010**     | —              | **Epic**            | **Log Sheet System**                                                                                               | **—** | **—** | **—** | **Σ** |
| :---           | :---           | :---                | :---                                                                                                               |  ---: |  ---: |  ---: |  ---: |
| **US-010-001** | EP-010         | **User Story**      | **As a technician, I want to manage log sheets so I can record periodic measurement data**                         | **—** | **—** | **—** | **Σ** |
| AC-010-001     | US-010-001     | Acceptance Criteria | Log sheet dashboard, project-based listing, and core CRUD                                                          |     — |     — |     — |     Σ |
| **WP-010-001** | AC-010-001     | **Work Package**    | **Backend (Logic & APIs)**                                                                                         | **—** | **—** | **—** | **Σ** |
| TK-010-001     | **WP-010-001** | Task                | Log sheet server actions: comprehensive CRUD & detail fetching (actions.ts)                                        |     3 |     5 |     9 |  5.33 |
| TK-010-002     | **WP-010-001** | Task                | Multi-part save actions: entries, photos, chemicals, machines (actions.ts)                                         |     2 |     4 |     7 |  4.17 |
| TK-010-003     | **WP-010-001** | Task                | Log sheet service: complex detail view builder with overrides & machine logic                                      |     4 |     7 |    12 |  7.33 |
| TK-010-004     | **WP-010-001** | Task                | Machine management logic: upsert with transaction & dependency handling                                            |   1.5 |     3 |     5 |  3.08 |
| TK-010-005     | **WP-010-001** | Task                | DTO mapping: bidirectional conversion between Prisma & UI interfaces (dto.ts)                                      |     1 |     2 |     4 |  2.17 |
| TK-010-006     | **WP-010-001** | Task                | RBAC enforcement: project-based access control & requirement checks                                                |     1 |     2 |     3 |  2.00 |
| **US-010-002** | EP-010         | **User Story**      | **As a technician, I want smart forms that validate my data in real-time**                                         | **—** | **—** | **—** | **Σ** |
| AC-010-002     | US-010-002     | Acceptance Criteria | Category-based completeness checking and range validation                                                          |     — |     — |     — |     Σ |
| **WP-010-002** | AC-010-002     | **Work Package**    | **Backend (Validation Engine)**                                                                                    | **—** | **—** | **—** | **Σ** |
| TK-010-007     | **WP-010-002** | Task                | Completeness engine: category/machine-aware validation logic (validation.ts)                                       |     2 |     4 |     7 |  4.17 |
| TK-010-008     | **WP-010-002** | Task                | Range validation: dynamic limit checking with raw water overrides (range-validation.ts)                            |     1 |     2 |     4 |  2.17 |
| TK-010-009     | **WP-010-002** | Task                | Typed value utilities: handling polymorphism for NUMBER/TEXT/BOOLEAN                                               |     1 |     2 |     3 |  2.00 |
| **US-010-003** | EP-010         | **User Story**      | **As a technician and client, I want to digitally sign log sheets so they can be formally submitted and approved** | **—** | **—** | **—** | **Σ** |
| AC-010-003     | US-010-003     | Acceptance Criteria | Secure signature capture and R2 storage integration                                                                |     — |     — |     — |     Σ |
| **WP-010-003** | AC-010-003     | **Work Package**    | **Backend (Signatures & Storage)**                                                                                 | **—** | **—** | **—** | **Σ** |
| TK-010-010     | **WP-010-003** | Task                | Signature processing action: Base64 decoding & R2 upload orchestration                                             |   1.5 |     3 |     6 |  3.25 |
| TK-010-011     | **WP-010-003** | Task                | Signature service: state-aware save logic with signer role validation                                              |     1 |     2 |     4 |  2.17 |
| :---           | :---           | :---                | :---                                                                                                               |  ---: |  ---: |  ---: |  ---: |
| **US-010-004** | EP-010         | **User Story**      | **As a supervisor, I want to control the log sheet lifecycle so I can ensure data quality**                        | **—** | **—** | **—** | **Σ** |
| AC-010-004     | US-010-004     | Acceptance Criteria | State machine for status transitions and immutable locking after approval                                          |     — |     — |     — |     Σ |
| **WP-010-004** | AC-010-004     | **Work Package**    | **Backend (Workflow & Locking)**                                                                                   | **—** | **—** | **—** | **Σ** |
| TK-010-012     | **WP-010-004** | Task                | Status transition engine: defining valid state moves & role-based branching                                        |     1 |     2 |     4 |  2.17 |
| TK-010-013     | **WP-010-004** | Task                | Workflow service: status orchestration with submission/approval timestamps                                         |     2 |     3 |     5 |  3.17 |
| TK-010-014     | **WP-010-004** | Task                | Locking mechanism: computing edit state based on status, lock flag & admin override                                |     1 |     2 |     3 |  2.00 |
| TK-010-015     | **WP-010-004** | Task                | Approval validation: deep category-aware completeness check for all active units                                   |     2 |     4 |     6 |  4.00 |
| TK-010-016     | **WP-010-004** | Task                | Edit permission utility: centralized lock enforcement for all mutation services                                    |   0.5 |     1 |     2 |  1.08 |
| **US-010-005** | EP-010         | **User Story**      | **As a stakeholder, I want to be notified of limit breaches so I can take corrective action**                      | **—** | **—** | **—** | **Σ** |
| AC-010-005     | US-010-005     | Acceptance Criteria | Automated limit evaluation and notification dispatch on submission                                                 |     — |     — |     — |     Σ |
| **WP-010-005** | AC-010-005     | **Work Package**    | **Backend (Notifications & Adapters)**                                                                             | **—** | **—** | **—** | **Σ** |
| TK-010-017     | **WP-010-005** | Task                | Notification orchestrator: evaluating breaches & technician recipient resolution                                   |     2 |     4 |     7 |  4.17 |
| TK-010-018     | **WP-010-005** | Task                | Limit breach adapter: mapping log sheet entries to evaluation snapshots                                            |     1 |     2 |     3 |  2.00 |
| **US-010-006** | EP-010         | **User Story**      | **As a technician, I want to manage log sheets so I can record periodic measurement data**                         | **—** | **—** | **—** | **Σ** |
| AC-010-006     | US-010-006     | Acceptance Criteria | Robust persistence of entries, photos, and chemical usage                                                          |     — |     — |     — |     Σ |
| **WP-010-006** | AC-010-006     | **Work Package**    | **Backend (Persistence Services)**                                                                                 | **—** | **—** | **—** | **Σ** |
| TK-010-019     | **WP-010-006** | Task                | Entry upsert service: transactional multi-row sync with empty-value soft delete                                    |     3 |     5 |     8 |  5.17 |
| TK-010-020     | **WP-010-006** | Task                | Water meter auto-calc: implementing Before/After/Total consumption logic                                           |   1.5 |     3 |     5 |  3.08 |
| TK-010-021     | **WP-010-006** | Task                | Chemical usage service: transactional sync of periodic chemical dosing                                             |     1 |     2 |     4 |  2.17 |
| TK-010-022     | **WP-010-006** | Task                | Photo management service: Before/After photo persistence with R2 metadata                                          |     1 |     2 |     4 |  2.17 |
| :---           | :---           | :---                | :---                                                                                                               |  ---: |  ---: |  ---: |  ---: |
| **US-010-007** | EP-010         | **User Story**      | **As a technician, I want to manage log sheets so I can record periodic measurement data**                         | **—** | **—** | **—** | **Σ** |
| AC-010-007     | US-010-007     | Acceptance Criteria | Intuitive desktop UI for log sheet creation and metadata management                                                |     — |     — |     — |     Σ |
| **WP-010-007** | AC-010-007     | **Work Package**    | **Frontend (Core Desktop UI)**                                                                                     | **—** | **—** | **—** | **Σ** |
| TK-010-023     | **WP-010-007** | Task                | Log sheet creation form: date management & technician selection logic                                              |   1.5 |     3 |     5 |  3.08 |
| TK-010-024     | **WP-010-007** | Task                | Header & Toolbar: responsive branding & multi-mode action controls (Save/Print/Submit)                             |     2 |     4 |     7 |  4.17 |
| TK-010-025     | **WP-010-007** | Task                | Machine selection panel: toggle logic for active units with persistence integration                                |     1 |     2 |     4 |  2.17 |
| **US-010-008** | EP-010         | **User Story**      | **As a technician, I want smart forms that validate my data in real-time**                                         | **—** | **—** | **—** | **Σ** |
| AC-010-008     | US-010-008     | Acceptance Criteria | Dynamic category-based layouts and polymorphic input handling                                                      |     — |     — |     — |     Σ |
| **WP-010-008** | AC-010-008     | **Work Package**    | **Frontend (Dynamic Form Engine)**                                                                                 | **—** | **—** | **—** | **Σ** |
| TK-010-026     | **WP-010-008** | Task                | Category section orchestrator: dynamic layout switching for Chiller/CT/General groups                              |     2 |     4 |     6 |  4.00 |
| TK-010-027     | **WP-010-008** | Task                | Cooling Water specialized layout: handling complex Row/Column/RawWater matrix                                      |     2 |     4 |     7 |  4.17 |
| TK-010-028     | **WP-010-008** | Task                | Polymorphic ParameterInput: handling NUMBER/BOOL/TEXT with integrated Camera access                                |     3 |     5 |     9 |  5.33 |
| **US-010-009** | EP-010         | **User Story**      | **As a technician, I want to track chemical usage so I can manage inventory consumption**                          | **—** | **—** | **—** | **Σ** |
| AC-010-009     | US-010-009     | Acceptance Criteria | Interactive chemical dosing entry table                                                                            |     — |     — |     — |     Σ |
| **WP-010-009** | AC-010-009     | **Work Package**    | **Frontend (Chemical Tracking UI)**                                                                                | **—** | **—** | **—** | **Σ** |
| TK-010-029     | **WP-010-009** | Task                | Chemical usage section: dynamic row management for multiple chemical dosages                                       |   1.5 |     3 |     5 |  3.08 |
| **US-010-010** | EP-010         | **User Story**      | **As a technician and client, I want to digitally sign log sheets so they can be formally submitted and approved** | **—** | **—** | **—** | **Σ** |
| AC-010-010     | US-010-010     | Acceptance Criteria | Canvas-based signature capture and preview UI                                                                      |     — |     — |     — |     Σ |
| **WP-010-010** | AC-010-010     | **Work Package**    | **Frontend (Signature UI)**                                                                                        | **—** | **—** | **—** | **Σ** |
| TK-010-030     | **WP-010-010** | Task                | SignaturePad: HTML5 Canvas implementation with high-DPI & touch/pointer support                                    |     3 |     5 |     8 |  5.17 |
| TK-010-031     | **WP-010-010** | Task                | SignatureSection: modal flow for capture, preview, and server action integration                                   |   1.5 |     3 |     5 |  3.08 |
| :---           | :---           | :---                | :---                                                                                                               |  ---: |  ---: |  ---: |  ---: |
| **US-010-011** | EP-010         | **User Story**      | **As a stakeholder, I want to print log sheets in a formal format for physical records**                           | **—** | **—** | **—** | **Σ** |
| AC-010-011     | US-010-011     | Acceptance Criteria | A4 portrait print-optimized layout with exact PT Corintek branding                                                 |     — |     — |     — |     Σ |
| **WP-010-011** | AC-010-011     | **Work Package**    | **Frontend (Print Layout Engine)**                                                                                 | **—** | **—** | **—** | **Σ** |
| TK-010-032     | **WP-010-011** | Task                | Print preview orchestrator: A4 portrait sizing, @media print CSS, and page break logic                             |     2 |     4 |     7 |  4.17 |
| TK-010-033     | **WP-010-011** | Task                | Matrix grid: Unit/Category-aware dynamic table rendering (Chiller/CT/General)                                      |   1.5 |     3 |     5 |  3.08 |
| TK-010-034     | **WP-010-011** | Task                | Cooling Water grid: handling Raw Water columns and dual-limit displays (Raw vs Unit)                               |     1 |     2 |     4 |  2.17 |
| TK-010-035     | **WP-010-011** | Task                | Consumption grid: specialized layout for Water Meter vs Chemical Fill-up logic                                     |     1 |     2 |     3 |  2.00 |
| TK-010-036     | **WP-010-011** | Task                | Documentation page: auto-generating photo grid for Before/After/WaterMeter images                                  |     2 |     4 |     6 |  4.00 |
| TK-010-037     | **WP-010-011** | Task                | Formal signature layout: branding alignment for technician & client sign-off blocks                                |     1 |   1.5 |     3 |  1.67 |
| TK-010-038     | **WP-010-011** | Task                | Format utilities: polymorphic value/limit formatting based on parameter categories                                 |     1 |     2 |     3 |  2.00 |
| :---           | :---           | :---                | :---                                                                                                               |  ---: |  ---: |  ---: |  ---: |
| **US-010-012** | EP-010         | **User Story**      | **As a technician, I want a mobile-optimized interface so I can easily record data while moving between units**    | **—** | **—** | **—** | **Σ** |
| AC-010-012     | US-010-012     | Acceptance Criteria | Unit-centric navigation with real-time completion status and optimized touch inputs                                |     — |     — |     — |     Σ |
| **WP-010-012** | AC-010-012     | **Work Package**    | **Frontend (Mobile Option A)**                                                                                     | **—** | **—** | **—** | **Σ** |
| TK-010-039     | **WP-010-012** | Task                | Mobile domain contracts: defining strict interfaces for unit-based view models                                     |     1 |   1.5 |     3 |  1.67 |
| TK-010-040     | **WP-010-012** | Task                | Unit View Model Builder: transforming flat data into unit/category hierarchy with status logic                     |     3 |     5 |     8 |  5.17 |
| TK-010-041     | **WP-010-012** | Task                | Entry State Context: client-side state engine for real-time updates & local validation                             |     2 |     4 |     6 |  4.00 |
| TK-010-042     | **WP-010-012** | Task                | Mobile layout & navigation: overview vs unit-entry screen transition orchestration                                 |   1.5 |     3 |     5 |  3.08 |
| TK-010-043     | **WP-010-012** | Task                | Unit Overview screen: progress dashboard with global Raw Water entry section                                       |     2 |     3 |     5 |  3.17 |
| TK-010-044     | **WP-010-012** | Task                | Unit Entry screen: category-grouped parameter inputs optimized for mobile touch                                    |     2 |     4 |     7 |  4.17 |
| TK-010-045     | **WP-010-012** | Task                | Consumption mobile view: optimized entry for Water Meters & Chemical Usage                                         |     1 |     2 |     4 |  2.17 |
| TK-010-046     | **WP-010-012** | Task                | Shared mobile UI: progress bars, status icons, and responsive layout primitives                                    |     1 |     2 |     3 |  2.00 |
| :---           | :---           | :---                | :---                                                                                                               |  ---: |  ---: |  ---: |  ---: |
| **US-010-013** | EP-010         | **User Story**      | **As a technician, I want to manage log sheets so I can record periodic measurement data**                         | **—** | **—** | **—** | **Σ** |
| AC-010-013     | US-010-013     | Acceptance Criteria | Seamless navigation from project list to history to entry workstation                                              |     — |     — |     — |     Σ |
| **WP-010-013** | AC-010-013     | **Work Package**    | **Frontend (Pages & Orchestration)**                                                                               | **—** | **—** | **—** | **Σ** |
| TK-010-047     | **WP-010-013** | Task                | Main Log Sheets page: project selection list with role-based visibility                                            |     1 |     2 |     4 |  2.17 |
| TK-010-048     | **WP-010-013** | Task                | Project History page: log sheet listing with status tracking and CRUD entry points                                 |   1.5 |     3 |     5 |  3.08 |
| TK-010-049     | **WP-010-013** | Task                | Entry Workstation: complex page orchestration (Desktop/Mobile-A/Mobile-B modes)                                    |     4 |     7 |    12 |  7.33 |
| **US-010-014** | EP-010         | **User Story**      | **As a technician, I want smart forms that validate my data in real-time**                                         | **—** | **—** | **—** | **Σ** |
| AC-010-014     | US-010-014     | Acceptance Criteria | Real-time draft persistence and cross-category validation                                                          |     — |     — |     — |     Σ |
| **WP-010-014** | AC-010-014     | **Work Package**    | **Frontend (State & Save Hooks)**                                                                                  | **—** | **—** | **—** | **Σ** |
| TK-010-050     | **WP-010-014** | Task                | Draft Saver Hook: orchestrating batch persistence of entries, chemicals, and R2 uploads                            |     3 |     5 |     9 |  5.33 |
| TK-010-051     | **WP-010-014** | Task                | Client-side Validation Hook: real-time completeness & range monitoring                                             |   1.5 |     3 |     5 |  3.08 |
| TK-010-052     | **WP-010-014** | Task                | Active Units Hook: managing dynamic machine visibility & state toggling                                            |     1 |     2 |     4 |  2.17 |
| TK-010-053     | **WP-010-014** | Task                | Draft State Hook: unified state management for heterogeneous log-sheet data points                                 |     1 |     2 |     3 |  2.00 |
| TK-010-054     | **WP-010-014** | Task                | Mobile ViewModel Bridge: mapping workstation state to Option A mobile contracts                                    |     2 |     4 |     6 |  4.00 |
| :---           | :---           | :---                | :---                                                                                                               |  ---: |  ---: |  ---: |  ---: |
| **US-010-015** | EP-010         | **User Story**      | **As a developer, I want comprehensive tests so I can safely refactor the complex log sheet logic**                | **—** | **—** | **—** | **Σ** |
| AC-010-015     | US-010-015     | Acceptance Criteria | 100% coverage of core business rules and edge cases via characterization tests                                     |     — |     — |     — |     Σ |
| **WP-010-015** | AC-010-015     | **Work Package**    | **Testing & QA (Log Sheet System)**                                                                                | **—** | **—** | **—** | **Σ** |
| TK-010-055     | **WP-010-015** | Task                | Service layer characterization: mocking Prisma transactions & complex fetching (service.ts)                        |     8 |    15 |    25 | 15.50 |
| TK-010-056     | **WP-010-015** | Task                | Server Action characterization: testing RBAC & multi-service orchestration (actions.ts)                            |     4 |     8 |    12 |  8.00 |
| TK-010-057     | **WP-010-015** | Task                | Validation engine characterization: exhaustive edge-case testing for completeness/range rules                      |     4 |     8 |    12 |  8.00 |
| TK-010-058     | **WP-010-015** | Task                | Option A Mobile ViewModel tests: verifying data transformation logic (unit-view-model-builder.ts)                  |     3 |     5 |     8 |  5.17 |
| TK-010-059     | **WP-010-015** | Task                | Workstation Hooks characterization: testing complex state/save/validation hooks (src/app/hooks)                    |     8 |    15 |    25 | 15.50 |
| TK-010-060     | **WP-010-015** | Task                | UI Component characterization: testing form interactions & mode-switching layouts                                  |     4 |     8 |    15 |  8.50 |
| TK-010-061     | **WP-010-015** | Task                | Utility unit tests: polymorphic value-type handling and date formatting helpers                                    |     2 |     4 |     6 |  4.00 |

## EP-011: Work Reporting System

| ID             | Parent         | Type                | Item                                                                                        |     O |     L |     P |     E |
| :------------- | :------------- | :------------------ | :------------------------------------------------------------------------------------------ | ----: | ----: | ----: | ----: |
| **EP-011**     | —              | **Epic**            | **Work Reporting System**                                                                   | **—** | **—** | **—** | **Σ** |
| **US-011-001** | EP-011         | **User Story**      | **As a technician, I want to create work reports so I can document ad-hoc site activities** | **—** | **—** | **—** | **Σ** |
| AC-011-001     | US-011-001     | Acceptance Criteria | Standardized reporting form with project, date, and activity details                        |     — |     — |     — |     Σ |
| **WP-011-001** | AC-011-001     | **Work Package**    | **Frontend (Reporting Form & Lists)**                                                       | **—** | **—** | **—** | **Σ** |
| TK-011-001     | **WP-011-001** | Task                | WorkReportForm: large form with machine selection and multi-section text inputs             |     3 |     5 |     8 |  5.17 |
| TK-011-002     | **WP-011-001** | Task                | Work report list UI with project selection and DataTable columns                            |   1.5 |     3 |     5 |  3.08 |
| TK-011-003     | **WP-011-001** | Task                | WorkReportHeader: CORPORATE-branded report header component                                 |   0.5 |     1 |     2 |  1.08 |
| **WP-011-002** | AC-011-001     | **Work Package**    | **Backend (Service & State)**                                                               | **—** | **—** | **—** | **Σ** |
| TK-011-004     | **WP-011-002** | Task                | Work report prisma schema (Report + Photos + Relations)                                     |     1 |     2 |     4 |  2.17 |
| TK-011-005     | **WP-011-002** | Task                | Work report service layer: CRUD, search, and soft-delete logic                              |   1.5 |     3 |     5 |  3.08 |
| TK-011-006     | **WP-011-002** | Task                | StatusPolicy: State machine for DRAFT/SUBMITTED/APPROVED flow                               |     1 |     2 |     3 |  2.00 |
| TK-011-007     | **WP-011-002** | Task                | Work report server actions (basic CRUD and revalidation)                                    |     1 |     2 |     4 |  2.17 |
| **WP-011-003** | AC-011-001     | **Work Package**    | **Testing & QA**                                                                            | **—** | **—** | **—** | **Σ** |
| TK-011-008     | **WP-011-003** | Task                | Work Report signature and repository integration tests                                      |     2 |     4 |     6 |  4.00 |

## EP-012: Summary Reports

| ID             | Parent         | Type                | Item                                                                               |     O |     L |     P |     E |
| :------------- | :------------- | :------------------ | :--------------------------------------------------------------------------------- | ----: | ----: | ----: | ----: |
| **EP-012**     | —              | **Epic**            | **Summary Reports**                                                                | **—** | **—** | **—** | **Σ** |
| **US-012-001** | EP-012         | **User Story**      | **As a reporting officer, I want to generate monthly summary reports for clients** | **—** | **—** | **—** | **Σ** |
| AC-012-001     | US-012-001     | Acceptance Criteria | Orchestrated report generation with TOC, chapters, and client attachments          |     — |     — |     — |     Σ |
| **WP-012-001** | AC-012-001     | **Work Package**    | **Frontend (Reporting UI)**                                                        | **—** | **—** | **—** | **Σ** |
| TK-012-001     | **WP-012-001** | Task                | SummaryReportsPage: project/period selection, notes, and chapter toggles           |     2 |   3.5 |     6 |  3.75 |
| TK-012-002     | **WP-012-001** | Task                | SummaryReportsPage: client attachment upload (R2) form & progress state            |   1.5 |     3 |     5 |  3.08 |
| TK-012-003     | **WP-012-001** | Task                | SummaryReportPrintPage: formal layout with TOC and cover page                      |   1.5 |     3 |     5 |  3.08 |
| TK-012-004     | **WP-012-001** | Task                | SummaryReportPrintPage: aggregation logic for log sheets/lab/work reports          |     2 |     4 |     7 |  4.17 |
| TK-012-005     | **WP-012-001** | Task                | AttachmentPackPrintPage: dedicated view for PDF/Image pack with object/iframe      |     1 |     2 |     4 |  2.17 |
| **WP-012-002** | AC-012-001     | **Work Package**    | **Backend (Aggregation Logic)**                                                    | **—** | **—** | **—** | **Σ** |
| TK-012-006     | **WP-012-002** | Task                | Aggregation service: fetching logs/lab/work data with UTC period logic             |     2 |     4 |     7 |  4.17 |
| TK-012-007     | **WP-012-002** | Task                | getProjectReportingScope: multi-project aggregation logic (Utama Addendum)         |   1.5 |     3 |     5 |  3.08 |
| TK-012-008     | **WP-012-002** | Task                | Chemical usage summary calculator (Map aggregation by chemicalId)                  |     1 |     2 |     3 |  2.00 |
| TK-012-009     | **WP-012-002** | Task                | Summary report server actions: create, update, and fetch by period                 |     1 |     2 |     4 |  2.17 |
| TK-012-010     | **WP-012-002** | Task                | R2 attachment upload action with filename sanitization and bearer auth             |   1.5 |     3 |     5 |  3.08 |
| **WP-012-003** | AC-012-001     | **Work Package**    | **Database**                                                                       | **—** | **—** | **—** | **Σ** |
| TK-012-011     | **WP-012-003** | Task                | SummaryReport model: unique constraint, status enum, and URL fields                |   0.5 |   1.5 |     3 |  1.67 |
| **WP-012-004** | AC-012-001     | **Work Package**    | **Testing & QA**                                                                   | **—** | **—** | **—** | **Σ** |
| TK-012-012     | **WP-012-004** | Task                | Aggregation service unit tests (date ranges, scoped projects)                      |   1.5 |     3 |     5 |  3.08 |

## EP-013: Notification System

| ID             | Parent         | Type                | Item                                                                               |     O |     L |     P |     E |
| :------------- | :------------- | :------------------ | :--------------------------------------------------------------------------------- | ----: | ----: | ----: | ----: |
| **EP-013**     | —              | **Epic**            | **Notification System**                                                            | **—** | **—** | **—** | **Σ** |
| **US-013-001** | EP-013         | **User Story**      | **As a user, I want to receive real-time alerts for critical system events**       | **—** | **—** | **—** | **Σ** |
| AC-013-001     | US-013-001     | Acceptance Criteria | Notification bell with unread count and item list with Read/Unread state           |     — |     — |     — |     Σ |
| **WP-013-001** | AC-013-001     | **Work Package**    | **Frontend (Alerts UI)**                                                           | **—** | **—** | **—** | **Σ** |
| TK-013-001     | **WP-013-001** | Task                | NotificationBell: UI component for the navbar with real-time unread badge          |     1 |     2 |     4 |  2.17 |
| TK-013-002     | **WP-013-001** | Task                | NotificationItem: layout for individual alerts by severity (INFO/WARNING/CRITICAL) |   0.5 |     1 |     2 |  1.08 |
| TK-013-003     | **WP-013-001** | Task                | useNotifications: client-side hook with 60s polling and optimistic updates         |   1.5 |   2.5 |     4 |  2.58 |
| **WP-013-002** | AC-013-001     | **Work Package**    | **Backend (Alerts Logic)**                                                         | **—** | **—** | **—** | **Σ** |
| TK-013-004     | **WP-013-002** | Task                | Notifications server actions (List, Read, Mark All) with path revalidation         |     1 |     2 |     3 |  2.00 |
| TK-013-005     | **WP-013-002** | Task                | NotificationService: core business logic for evaluation and dispatch               |     2 |     4 |     6 |  4.00 |
| TK-013-006     | **WP-013-002** | Task                | LimitBreachDetector: rules engine for identifying out-of-range parameters          |   1.5 |     3 |     5 |  3.08 |
| TK-013-007     | **WP-013-002** | Task                | NotificationRepository: Prisma implementation with pagination and transactions     |   1.5 |   2.5 |     4 |  2.58 |
| TK-013-008     | **WP-013-002** | Task                | Domain Types & Interfaces: Zod-like validation and comprehensive type system       |   0.5 |     1 |     2 |  1.08 |
| **WP-013-003** | AC-013-001     | **Work Package**    | **Database**                                                                       | **—** | **—** | **—** | **Σ** |
| TK-013-009     | **WP-013-003** | Task                | Prisma schema: Notification model with indices and severity enums                  |   0.5 |     1 |     2 |  1.08 |
| **WP-013-004** | AC-013-001     | **Work Package**    | **Testing & QA**                                                                   | **—** | **—** | **—** | **Σ** |
| TK-013-010     | **WP-013-004** | Task                | Unit tests for NotificationService and LimitBreachDetector                         |   1.5 |     3 |     5 |  3.08 |
| TK-013-011     | **WP-013-004** | Task                | Hook tests with timer mocks for polling and optimistic state                       |     1 |     2 |     4 |  2.17 |
| **WP-013-005** | AC-013-001     | **Work Package**    | **Testing & QA**                                                                   | **—** | **—** | **—** | **Σ** |
| TK-013-012     | **WP-013-005** | Task                | Notification service and real-time hook tests                                      |   1.5 |     3 |     5 |  3.08 |

## EP-014: Dashboard

| ID             | Parent         | Type                | Item                                                                                           |     O |     L |     P |     E |
| :------------- | :------------- | :------------------ | :--------------------------------------------------------------------------------------------- | ----: | ----: | ----: | ----: |
| **EP-014**     | —              | **Epic**            | **Dashboard**                                                                                  | **—** | **—** | **—** | **Σ** |
| **US-014-001** | EP-014         | **User Story**      | **As a user, I want to see a personalized dashboard with relevant metrics and project status** | **—** | **—** | **—** | **Σ** |
| AC-014-001     | US-014-001     | Acceptance Criteria | Role-based dashboard views (Admin vs Scoped)                                                   |     — |     — |     — |     Σ |
| AC-014-002     | US-014-001     | Acceptance Criteria | Real-time project tracking for technicians and clients                                         |     — |     — |     — |     Σ |
| AC-014-003     | US-014-001     | Acceptance Criteria | Historical performance trends for Ampere and Approach metrics                                  |     — |     — |     — |     Σ |
| **WP-014-001** | AC-014-003     | **Work Package**    | **Frontend (Dashboard UI)**                                                                    | **—** | **—** | **—** | **Σ** |
| TK-014-001     | **WP-014-001** | Task                | MetricLineChart: Generic Recharts integration (responsive, tooltip, legend)                    |     2 |     3 |     5 |  3.17 |
| TK-014-002     | **WP-014-001** | Task                | AmpereChart & ApproachChart: Parameter-specific chart specializations                          |     1 |   1.5 |     3 |  1.67 |
| TK-014-003     | **WP-014-001** | Task                | RecentPhotosGallery: Grid view with metadata overlays and image optimization                   |   1.5 |     3 |     5 |  3.08 |
| TK-014-004     | **WP-014-001** | Task                | DashboardScoped: Interactive view with real-time polling and project cards                     |     3 |     5 |     8 |  5.17 |
| TK-014-005     | **WP-014-001** | Task                | AnalyticsDashboard: Main container for trend and photo components                              |     1 |     2 |     4 |  2.17 |
| TK-014-006     | **WP-014-001** | Task                | Dashboard Main Page: Role-based switching logic and landing UI                                 |     1 |     2 |     3 |  2.00 |
| **WP-014-002** | AC-014-003     | **Work Package**    | **Backend (Dashboard & Analytics Logic)**                                                      | **—** | **—** | **—** | **Σ** |
| TK-014-007     | **WP-014-002** | Task                | getDashboardMetrics: Data aggregation, date grouping, and averaging logic                      |     2 |     4 |     7 |  4.17 |
| TK-014-008     | **WP-014-002** | Task                | resolveTargetProjectIds: Role-based project scoping security logic                             |   1.5 |     3 |     5 |  3.08 |
| TK-014-009     | **WP-014-002** | Task                | Dashboard Server Actions (Metrics, Photos) with Zod validation                                 |     1 |     2 |     4 |  2.17 |
| TK-014-010     | **WP-014-002** | Task                | getRecentLogSheetPhotos: Optimized query for latest documentation assets                       |   0.5 |     1 |     2 |  1.08 |
| **WP-014-003** | AC-014-003     | **Work Package**    | **Testing & Validation**                                                                       | **—** | **—** | **—** | **Σ** |
| TK-014-011     | **WP-014-003** | Task                | Unit tests for project scoping utility (utils.test.ts)                                         |     1 |     2 |     3 |  2.00 |
| **WP-014-004** | AC-014-003     | **Work Package**    | **Testing & QA**                                                                               | **—** | **—** | **—** | **Σ** |
| TK-014-012     | **WP-014-004** | Task                | Dashboard analytical helper tests (utils.test.ts)                                              |   0.5 |     1 |     2 |  1.08 |

## EP-015: Client Portal & Profile

| ID             | Parent         | Type                    | Item                                                                           |     O |     L |     P |     E |
| :------------- | :------------- | :---------------------- | :----------------------------------------------------------------------------- | ----: | ----: | ----: | ----: |
| **EP-015**     | —              | **Epic**                | **Client Portal & Profile**                                                    | **—** | **—** | **—** | **Σ** |
| **US-015-001** | EP-015         | **User Story**          | **As a user, I want to manage my personal profile and view assigned projects** | **—** | **—** | **—** | **Σ** |
| AC-015-001     | US-015-001     | **Acceptance Criteria** | **Profile self-service (edit text, update avatar)**                            | **—** | **—** | **—** | **Σ** |
| **WP-015-001** | AC-015-001     | **Work Package**        | **Frontend (Profile UI)**                                                      | **—** | **—** | **—** | **Σ** |
| TK-015-001     | **WP-015-001** | Task                    | MyProfilePage: Server layout, profile data fetching & container                |   0.5 |     1 |     2 |  1.08 |
| TK-015-002     | **WP-015-001** | Task                    | ProfileForm: Zod integration, Form UI, Toast feedback                          |     2 |     4 |     6 |  4.00 |
| TK-015-003     | **WP-015-001** | Task                    | Avatar Management: Image preview, fallback logic, upload trigger               |   1.5 |     3 |     5 |  3.08 |
| **WP-015-002** | AC-015-001     | **Work Package**        | **Backend (Profile Logic)**                                                    | **—** | **—** | **—** | **Σ** |
| TK-015-004     | **WP-015-002** | Task                    | Profile Server Actions: Fetch current, Update data (revalidation)              |     1 |     2 |     4 |  2.17 |
| TK-015-005     | **WP-015-002** | Task                    | Avatar Upload Action: R2 integration, metadata handling                        |     2 |     4 |     7 |  4.17 |
| TK-015-006     | **WP-015-002** | Task                    | Profile Service: Prisma queries for self-service updates                       |   0.5 |   1.5 |     3 |  1.67 |
| **WP-015-003** | AC-015-001     | **Work Package**        | **Testing & QA**                                                               | **—** | **—** | **—** | **Σ** |
| TK-015-007     | **WP-015-003** | Task                    | Unit tests for Profile Actions (Mocks, success/fail paths)                     |     1 |     2 |     4 |  2.17 |
| TK-015-008     | **WP-015-003** | Task                    | Service tests for Profile CRUD and phone uniqueness                            |     1 |     2 |     3 |  2.00 |
| AC-015-002     | US-015-001     | **Acceptance Criteria** | **Read-only Client/Technician project portal**                                 | **—** | **—** | **—** | **Σ** |
| **WP-015-004** | AC-015-002     | **Work Package**        | **Frontend (Portal UI)**                                                       | **—** | **—** | **—** | **Σ** |
| TK-015-009     | **WP-015-004** | Task                    | MyProjectPage: Dashboard summary for specific project assignment               |     1 |     2 |     4 |  2.17 |
| TK-015-010     | **WP-015-004** | Task                    | ForbiddenPage: Unauthorized access fallback UI                                 |   0.5 |     1 |     2 |  1.08 |
| TK-015-011     | **WP-015-004** | Task                    | NavUser: Dropdown profile & settings links integration                         |   0.5 |     1 |   1.5 |  1.00 |
| **WP-015-005** | AC-015-002     | **Work Package**        | **Backend (Portal Logic)**                                                     | **—** | **—** | **—** | **Σ** |
| TK-015-012     | **WP-015-005** | Task                    | Project Access Policy: buildProjectAccessWhere RBAC-safe logic                 |   1.5 |     3 |     5 |  3.08 |

## EP-016: Infrastructure

| ID             | Parent         | Type                | Item                                                                                                           |     O |     L |     P |     E |
| :------------- | :------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- | ----: | ----: | ----: | ----: |
| **EP-016**     | —              | **Epic**            | **Infrastructure**                                                                                             | **—** | **—** | **—** | **Σ** |
| **US-016-001** | EP-016         | **User Story**      | **As a developer, I want a set of reusable UI primitives to ensure visual consistency**                        | **—** | **—** | **—** | **Σ** |
| AC-016-001     | US-016-001     | Acceptance Criteria | Standardized DataTable, CrudDialog, and ActionCell components                                                  |     — |     — |     — |     Σ |
| **WP-016-001** | AC-016-001     | **Work Package**    | **Frontend (Shared UI Primitives)**                                                                            | **—** | **—** | **—** | **Σ** |
| TK-016-001     | **WP-016-001** | Task                | DataTable: implementation with TanStack Table, sorting, pagination & mobile card view                          |     4 |     6 |    10 |  6.33 |
| TK-016-002     | **WP-016-001** | Task                | CrudDialog: responsive wrapper for shadcn dialog with success/cancel callbacks                                 |     1 |     2 |     4 |  2.17 |
| TK-016-003     | **WP-016-001** | Task                | ActionCell: dropdown menu for Edit/Delete with AlertDialog confirmation                                        |   1.5 |     3 |     5 |  3.08 |
| TK-016-004     | **WP-016-001** | Task                | AppSidebar: collapsible navigation with RBAC filtering & NavMain/NavUser                                       |     2 |     4 |     6 |  4.00 |
| TK-016-005     | **WP-016-001** | Task                | MobileNav: bottom navigation with RBAC filtering for technician mobile access                                  |     1 |     2 |     3 |  2.00 |
| TK-016-006     | **WP-016-001** | Task                | CameraInput: browser-native camera access, 1:1 square cropping & WebP compression                              |     3 |     5 |     8 |  5.17 |
| TK-016-007     | **WP-016-001** | Task                | MultiSelect: combobox with search and removable badges                                                         |   1.5 |   2.5 |     4 |  2.67 |
| TK-016-008     | **WP-016-001** | Task                | DatePicker: shadcn calendar wrapper with locale-id support                                                     |   0.5 |     1 |     2 |  1.08 |
| TK-016-009     | **WP-016-001** | Task                | MachineFormSection: complex field array management for machine lists in projects                               |     2 |     4 |     7 |  4.17 |
| TK-016-010     | **WP-016-001** | Task                | SignaturePreview: component for displaying signed photos with metadata                                         |   0.5 |     1 |     2 |  1.08 |
| TK-016-011     | **WP-016-001** | Task                | MetricLineChart: reusable Recharts wrapper with empty states and line config                                   |   1.5 |     3 |     5 |  3.08 |
| TK-016-012     | **WP-016-001** | Task                | RootLayout & MainLayout: app shell orchestration with sticky header and sidebar                                |   1.5 |     3 |     5 |  3.08 |
| **US-016-002** | EP-016         | **User Story**      | **As a developer, I want core utility functions to handle auth, RBAC, and file operations**                    | **—** | **—** | **—** | **Σ** |
| AC-016-002     | US-016-002     | Acceptance Criteria | Centralized RBAC matrix, JWT handling, and R2 upload utilities                                                 |     — |     — |     — |     Σ |
| **WP-016-002** | AC-016-002     | **Work Package**    | **Backend (Core Logic & Infrastructure)**                                                                      | **—** | **—** | **—** | **Σ** |
| TK-016-013     | **WP-016-002** | Task                | RBAC: implementation of role matrix, resource mapping, and access guard helpers                                |     2 |     4 |     7 |  4.17 |
| TK-016-014     | **WP-016-002** | Task                | Auth Helpers: JWT session management, cookie handling, and actor retrieval                                     |   1.5 |     3 |     5 |  3.08 |
| TK-016-015     | **WP-016-002** | Task                | JWT Utility: sign/verify implementation using jose library                                                     |   0.5 |     1 |     2 |  1.08 |
| TK-016-016     | **WP-016-002** | Task                | Action Helpers: standardized ActionResult types and error logging for server actions                           |   0.5 |     1 |     2 |  1.08 |
| TK-016-017     | **WP-016-002** | Task                | Image Compression Engine (V2): canvas-based WebP compression with smart resizing                               |     2 |     3 |     5 |  3.17 |
| TK-016-018     | **WP-016-002** | Task                | R2 Upload: client-side fetch integration with Cloudflare Worker API                                            |   0.5 |     1 |     2 |  1.08 |
| TK-016-019     | **WP-016-002** | Task                | Prisma Infrastructure: singleton client setup and shared select fragments                                      |     1 |     2 |     3 |  2.00 |
| **US-016-003** | EP-016         | **User Story**      | **As a developer, I want automated seeding and quality gates to maintain data consistency and code standards** | **—** | **—** | **—** | **Σ** |
| AC-016-003     | US-016-003     | Acceptance Criteria | Automated seeding scripts and git hooks for linting/commit validation                                          |     — |     — |     — |     Σ |
| **WP-016-003** | AC-016-003     | **Work Package**    | **DevOps (Data & Quality)**                                                                                    | **—** | **—** | **—** | **Σ** |
| TK-016-020     | **WP-016-003** | Task                | Database Seeding: Implementation of `seed.ts` and `seed-data.ts` for multi-domain upserts                      |     2 |     4 |     7 |  4.17 |
| TK-016-021     | **WP-016-003** | Task                | Seed Export/Import: Orchestration script `seed-export.ts` for automated data portability                       |     2 |     3 |     5 |  3.17 |
| TK-016-022     | **WP-016-003** | Task                | Husky & lint-staged: Pre-commit hook integration with `package.json` scripts                                   |     1 |   1.5 |     3 |  1.67 |
| TK-016-023     | **WP-016-003** | Task                | Commitlint: Configuration and enforcement of conventional commit standards                                     |   0.5 |     1 |     2 |  1.08 |
| TK-016-024     | **WP-016-003** | Task                | ESLint & Prettier: Flat config (`eslint.config.mjs`) for strict TS/React rules and formatting                  |   1.5 |     3 |     5 |  3.08 |
| TK-016-025     | **WP-016-003** | Task                | Environment Configuration: Seeding documentation and developer guides (`SEED_README.md`)                       |   0.5 |     1 |     2 |  1.08 |
| **WP-016-004** | AC-016-003     | **Work Package**    | **Quality Assurance (Testing Infrastructure)**                                                                 | **—** | **—** | **—** | **Σ** |
| TK-016-026     | **WP-016-004** | Task                | Vitest global setup: DOM mocks, RTL, and Prisma mocks                                                          |   1.5 |     3 |     5 |  3.08 |
| TK-016-027     | **WP-016-004** | Task                | Core Security Tests: RBAC and Auth helper policy tests                                                         |   1.5 |     3 |     5 |  3.08 |
| TK-016-028     | **WP-016-004** | Task                | Playwright E2E Framework: configuration and setup                                                              |     2 |     4 |     8 |  4.33 |
| TK-016-029     | **WP-016-004** | Task                | E2E Fixtures: Log sheet page objects and data factories                                                        |     2 |     4 |     7 |  4.17 |
| TK-016-030     | **WP-016-004** | Task                | E2E Suite: Full technician workflow (draft to submit)                                                          |     2 |     4 |     8 |  4.33 |
| TK-016-031     | **WP-016-004** | Task                | E2E Suite: Admin workflows (approval, override, unlock)                                                        |     2 |     4 |     8 |  4.33 |
| TK-016-032     | **WP-016-004** | Task                | E2E Suite: Validation & Error Recovery scenarios                                                               |     3 |     5 |    10 |  5.50 |
| TK-016-033     | **WP-016-004** | Task                | Action Helpers: server action response wrapper tests                                                           |   0.5 |     1 |     2 |  1.08 |

## EP-017: Cloudflare Worker

| ID             | Parent         | Type                | Item                                                                                        |     O |     L |     P |     E |
| :------------- | :------------- | :------------------ | :------------------------------------------------------------------------------------------ | ----: | ----: | ----: | ----: |
| **EP-017**     | —              | **Epic**            | **Cloudflare Worker**                                                                       | **—** | **—** | **—** | **Σ** |
| **US-017-001** | EP-017         | **User Story**      | **As a developer, I want a dedicated asset worker to handle secure R2 uploads and serving** | **—** | **—** | **—** | **Σ** |
| AC-017-001     | US-017-001     | Acceptance Criteria | Cloudflare Worker with R2 bucket binding and Bearer Token authentication                    |     — |     — |     — |     Σ |
| **WP-017-001** | AC-017-001     | **Work Package**    | **Worker Implementation**                                                                   | **—** | **—** | **—** | **Σ** |
| TK-017-001     | **WP-017-001** | Task                | R2 Object Handlers: GET (fetch), PUT (upload), DELETE (remove)                              |     1 |     2 |     4 |  2.17 |
| TK-017-002     | **WP-017-001** | Task                | R2 Bucket Listing API: GET root with optional prefix filtering                              |   0.5 |     1 |     2 |  1.08 |
| TK-017-003     | **WP-017-001** | Task                | Security: Bearer Token authentication middleware for write operations                       |   0.5 |     1 |     2 |  1.08 |
| TK-017-004     | **WP-017-001** | Task                | CORS: Implementation of OPTIONS preflight and cross-origin headers                          |   0.5 |     1 |     2 |  1.08 |
| TK-017-005     | **WP-017-001** | Task                | Error Handling: Standardized 4xx/5xx responses with CORS support                            |   0.5 |     1 |   1.5 |  1.00 |
| **WP-017-002** | AC-017-001     | **Work Package**    | **DevOps & Infrastructure**                                                                 | **—** | **—** | **—** | **Σ** |
| TK-017-006     | **WP-017-002** | Task                | Wrangler Config: Multi-environment setup (dev, staging, production)                         |     1 |     2 |     3 |  2.00 |
| TK-017-007     | **WP-017-002** | Task                | R2 Bucket: Lifecycle policy and binding configuration                                       |   0.5 |     1 |     2 |  1.08 |
| TK-017-008     | **WP-017-002** | Task                | Deployment: Scripts for environment-specific worker publishing                              |   0.5 |     1 |     2 |  1.08 |
| **WP-017-003** | AC-017-001     | **Work Package**    | **Testing & QA**                                                                            | **—** | **—** | **—** | **Σ** |
| TK-017-009     | **WP-017-003** | Task                | Vitest Suite: R2 mock environment and CRUD operation tests                                  |   1.5 |     3 |     5 |  3.08 |
| TK-017-010     | **WP-017-003** | Task                | Security Tests: Unauthorized access and invalid method rejection                            |   0.5 |     1 |     2 |  1.08 |
