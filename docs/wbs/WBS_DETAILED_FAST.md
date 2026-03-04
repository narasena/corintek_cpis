# CPIS — Work Breakdown Structure (WBS)

> **Project:** Corintek Project Information System (CPIS)
> **Prepared by:** Gemini CLI
> **Date:** 2026-03-03
> **Version:** Detailed (Task-Level)
> **Estimation Method:** PERT (Program Evaluation and Review Technique)
> **Rate Basis:** Mid-Level Developer — **Rp 85,000/hr**

---

## Legend

| Column     | Description                                                                                                           |
| :--------- | :-------------------------------------------------------------------------------------------------------------------- |
| **ID**     | Hierarchical identifier: `EP` = Epic, `US` = User Story, `AC` = Acceptance Criteria, `WP` = Work Package, `TK` = Task |
| **Parent** | Parent ID this item belongs to                                                                                        |
| **Type**   | Epic / User Story / Acceptance Criteria / Work Package / Task                                                         |
| **Item**   | Description of the work                                                                                               |
| **O**      | Optimistic hours (best case)                                                                                          |
| **L**      | Likely hours (normal case)                                                                                            |
| **P**      | Pessimistic hours (worst case)                                                                                        |
| **E**      | Expected hours = `(O + 4L + P) / 6`                                                                                   |

---

## How to Read This Document

- **Epics** (pink rows) = Major feature areas. Their hours are the **sum** of all child items.
- **User Stories** = What the user wants to achieve. Sum of their Acceptance Criteria.
- **Acceptance Criteria** = Testable conditions. Sum of their Work Packages.
- **Work Packages** = Groupings (Frontend, Backend, DB, Testing). Sum of their Tasks.
- **Tasks** = Atomic units of work with individual PERT estimates.

---

## PERT Formula

```
Expected = (Optimistic + 4 × Likely + Pessimistic) / 6
```

---

## EP-001: Authentication & Session Management

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-001** | — | **Epic** | **Authentication & Session Management** | **—** | **—** | **—** | **Σ** |
| **US-001** | EP-001 | **User Story** | **As an internal user, I want to log in so I can access the system** | **—** | **—** | **—** | **Σ** |
| AC-001 | US-001 | Acceptance Criteria | Email/Password Authentication with JWT | — | — | — | Σ |
| **WP-001** | AC-001 | **Work Package** | **Frontend (UI/UX)** | **—** | **—** | **—** | **Σ** |
| TK-001 | WP-001 | Task | Login page layout & responsive design (src/app/login/page.tsx) | 1 | 2 | 4 | 2.17 |
| TK-002 | WP-001 | Task | Login form with validation (react-hook-form + zod) | 2 | 3 | 5 | 3.17 |
| TK-003 | WP-001 | Task | Integration with useActionState for login feedback | 1 | 1.5 | 3 | 1.67 |
| **WP-002** | AC-001 | **Work Package** | **Backend (Logic & APIs)** | **—** | **—** | **—** | **Σ** |
| TK-004 | WP-002 | Task | Auth server actions: loginAction & logoutAction | 2 | 3 | 6 | 3.33 |
| TK-005 | WP-002 | Task | Auth service layer: authenticateUser & getUserById | 1 | 2 | 4 | 2.17 |
| TK-019 | WP-002 | Task | JWT implementation (generateToken, verifyToken using jose) | 1 | 2 | 4 | 2.17 |
| TK-020 | WP-002 | Task | Middleware: Route protection & RBAC enforcement | 2 | 4 | 7 | 4.17 |
| TK-021 | WP-002 | Task | RBAC Engine: role matrix & resource mapping (src/lib/rbac.ts) | 2 | 4 | 6 | 4.00 |
| TK-022 | WP-002 | Task | Auth helpers: getCurrentUser, requireActor, hash/compare password | 1 | 2 | 4 | 2.17 |
| **WP-003** | AC-001 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-023 | WP-003 | Task | Auth helpers unit tests (src/lib/auth-helpers.test.ts) | 2 | 3 | 5 | 3.17 |
| TK-024 | WP-003 | Task | RBAC matrix & access control unit tests (src/lib/rbac.test.ts) | 2 | 3 | 5 | 3.17 |

---

## EP-016: Infrastructure & Foundation

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-016** | — | **Epic** | **Infrastructure & Foundation** | **—** | **—** | **—** | **Σ** |
| **US-016-001** | EP-016 | **User Story** | **As a developer, I want a robust database schema to ensure data integrity across domains** | **—** | **—** | **—** | **Σ** |
| AC-016-001 | US-016-001 | Acceptance Criteria | Normalized domain-driven relational schema (Prisma) | — | — | — | Σ |
| **WP-016-001** | AC-016-001 | **Work Package** | **Database (Domain Modeling)** | **—** | **—** | **—** | **Σ** |
| TK-016-001 | WP-016-001 | Task | Global Prisma configuration & DB provider setup | 0.5 | 1 | 2 | 1.08 |
| TK-016-002 | WP-016-001 | Task | User domain modeling (User, Role, EmploymentStatus) | 1 | 2 | 4 | 2.17 |
| TK-016-003 | WP-016-001 | Task | Client & Project domain modeling (Client, Project, Status) | 2 | 4 | 7 | 4.17 |
| TK-016-004 | WP-016-001 | Task | Project assignments & parameter overrides modeling | 1 | 2 | 4 | 2.17 |
| TK-016-005 | WP-016-001 | Task | Machine domain modeling (Machine, Type, Ownership) | 1 | 2 | 3 | 2.00 |
| TK-016-006 | WP-016-001 | Task | Chemical & Usage modeling (Chemical, ChemicalUsage) | 1 | 2 | 4 | 2.17 |
| TK-016-007 | WP-016-001 | Task | Parameter & Limit Profile modeling (Parameter, Profile, Limits) | 2 | 4 | 8 | 4.33 |
| TK-016-008 | WP-016-001 | Task | Attendance domain modeling (Attendance, Photo URLs) | 1 | 1.5 | 3 | 1.67 |
| TK-016-009 | WP-016-001 | Task | Log Sheet domain modeling (LogSheet, Entry, Photo, Machine) | 3 | 5 | 10 | 5.50 |
| TK-016-010 | WP-016-001 | Task | Work Report domain modeling (WorkReport, Photo, Status) | 1 | 3 | 6 | 3.17 |
| TK-016-011 | WP-016-001 | Task | Lab Analysis domain modeling (Analysis, Column, Entry) | 2 | 4 | 7 | 4.17 |
| TK-016-012 | WP-016-001 | Task | Summary Report & Notification modeling | 1 | 2 | 4 | 2.17 |
| TK-016-013 | WP-016-001 | Task | Implementation of 31 incremental schema migrations | 8 | 15 | 25 | 15.50 |
| **US-016-002** | EP-016 | **User Story** | **As a developer, I want a set of reusable UI primitives to ensure visual consistency** | **—** | **—** | **—** | **Σ** |
| AC-016-002 | US-016-002 | Acceptance Criteria | Standardized DataTable, CrudDialog, and ActionCell components | — | — | — | Σ |
| **WP-016-002** | AC-016-002 | **Work Package** | **Frontend (Shared UI Primitives)** | **—** | **—** | **—** | **Σ** |
| TK-016-014 | WP-016-002 | Task | DataTable: implementation with TanStack Table, sorting, pagination & mobile card view | 4 | 6 | 10 | 6.33 |
| TK-016-015 | WP-016-002 | Task | CrudDialog: wrapper for shadcn dialog with success/cancel callbacks | 1 | 2 | 4 | 2.17 |
| TK-016-016 | WP-016-002 | Task | ActionCell: dropdown menu for Edit/Delete with AlertDialog confirmation | 1.5 | 3 | 5 | 3.08 |
| TK-016-017 | WP-016-002 | Task | AppSidebar: collapsible navigation with RBAC filtering | 2 | 4 | 6 | 4.00 |
| TK-016-018 | WP-016-002 | Task | MobileNav: bottom navigation for technician mobile access | 1 | 2 | 3 | 2.00 |
| TK-016-019 | WP-016-002 | Task | CameraInput: browser-native camera access, 1:1 cropping & preview | 3 | 5 | 8 | 5.17 |
| TK-016-020 | WP-016-002 | Task | MultiSelect & DatePicker specialized shared components | 2 | 3 | 5 | 3.17 |
| TK-016-021 | WP-016-002 | Task | Main layout & Root layout with Toast provider (sonner) | 1 | 2 | 3 | 2.00 |
| **US-016-003** | EP-016 | **User Story** | **As a developer, I want shared utilities for image processing and server-side logic** | **—** | **—** | **—** | **Σ** |
| AC-016-003 | US-016-003 | Acceptance Criteria | Centralized Prisma client, image compression, and action helpers | — | — | — | Σ |
| **WP-016-003** | AC-016-003 | **Work Package** | **Infrastructure (Shared Logic)** | **—** | **—** | **—** | **Σ** |
| TK-016-022 | WP-016-003 | Task | Prisma client singleton with PG adapter & logging config | 0.5 | 1 | 2 | 1.08 |
| TK-016-023 | WP-016-003 | Task | Action Helpers: ok/err/unauthorized result wrappers | 0.5 | 1 | 2 | 1.08 |
| TK-016-024 | WP-016-003 | Task | Image Compression: V2 Engine (WebP) implementation | 2 | 3 | 5 | 3.17 |
| TK-016-025 | WP-016-003 | Task | useImageCompression hook for UI-side processing | 1 | 1.5 | 3 | 1.67 |
| TK-016-026 | WP-016-003 | Task | R2 Upload: client for Cloudflare Worker integration | 1 | 1.5 | 3 | 1.67 |
| TK-016-027 | WP-016-003 | Task | Shared DTOs and global TypeScript interfaces (@types/) | 2 | 4 | 8 | 4.33 |

--- 

## EP-002: User Management

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-002** | — | **Epic** | **User Management** | **—** | **—** | **—** | **Σ** |
| **US-002** | EP-002 | **User Story** | **As an admin, I want to manage system users so I can control access and roles** | **—** | **—** | **—** | **Σ** |
| AC-002 | US-002 | Acceptance Criteria | CRUD operations with role and employment status management | — | — | — | Σ |
| **WP-002-001** | AC-002 | **Work Package** | **Frontend (UI/UX)** | **—** | **—** | **—** | **Σ** |
| TK-002-001 | WP-002-001 | Task | Users list page with DataTable integration (src/app/(main)/users/page.tsx) | 2 | 4 | 6 | 4.00 |
| TK-002-002 | WP-002-001 | Task | User definition columns with Edit/Delete actions | 1 | 2 | 3 | 2.00 |
| TK-002-003 | WP-002-001 | Task | UserForm: Comprehensive form with validation (create/edit mode) | 3 | 5 | 8 | 5.17 |
| TK-002-004 | WP-002-001 | Task | UserDialog: wrapper for creating and editing users | 0.5 | 1 | 2 | 1.08 |
| TK-002-005 | WP-002-001 | Task | My Profile page: avatar upload and profile details update | 2 | 4 | 6 | 4.00 |
| **WP-002-002** | AC-002 | **Work Package** | **Backend (Logic & APIs)** | **—** | **—** | **—** | **Σ** |
| TK-002-006 | WP-002-002 | Task | Users server actions (CRUD, Profile, Avatar upload) | 2 | 4 | 7 | 4.17 |
| TK-002-007 | WP-002-002 | Task | Users service layer (Admin & Profile logic) | 2 | 4 | 8 | 4.33 |
| TK-002-008 | WP-002-002 | Task | Soft delete implementation and unique constraint handling | 1 | 2 | 4 | 2.17 |
| TK-002-009 | WP-002-002 | Task | Password hashing with bcrypt during user creation/update | 0.5 | 1 | 2 | 1.08 |
| **WP-002-003** | AC-002 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-002-010 | WP-002-003 | Task | Users server actions unit tests (src/features/users/actions.test.ts) | 2 | 4 | 6 | 4.00 |
| TK-002-011 | WP-002-003 | Task | Users service layer unit tests (src/features/users/service.test.ts) | 2 | 4 | 6 | 4.00 |

--- 

## EP-003: Client Management

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-003** | — | **Epic** | **Client Management** | **—** | **—** | **—** | **Σ** |
| **US-003** | EP-003 | **User Story** | **As an admin, I want to manage clients so I can track project ownership** | **—** | **—** | **—** | **Σ** |
| AC-003 | US-003 | Acceptance Criteria | CRUD operations for client companies with soft delete | — | — | — | Σ |
| **WP-003-001** | AC-003 | **Work Package** | **Frontend (UI/UX)** | **—** | **—** | **—** | **Σ** |
| TK-003-001 | WP-003-001 | Task | Clients list page with DataTable integration (src/app/(main)/clients/page.tsx) | 1.5 | 3 | 5 | 3.08 |
| TK-003-002 | WP-003-001 | Task | Client definition columns with Edit/Delete actions | 1 | 2 | 3 | 2.00 |
| TK-003-003 | WP-003-001 | Task | ClientForm: creation and editing form with validation | 2 | 3 | 5 | 3.17 |
| TK-003-004 | WP-003-001 | Task | ClientDialog: wrapper for client forms | 0.5 | 1 | 2 | 1.08 |
| **WP-003-002** | AC-003 | **Work Package** | **Backend (Logic & APIs)** | **—** | **—** | **—** | **Σ** |
| TK-003-005 | WP-003-002 | Task | Clients server actions (CRUD) | 1 | 2 | 4 | 2.17 |
| TK-003-006 | WP-003-002 | Task | Clients service layer (Prisma queries & soft delete) | 1 | 2 | 4 | 2.17 |
| TK-003-007 | WP-003-002 | Task | Client name uniqueness validation logic | 0.5 | 1 | 2 | 1.08 |

--- 

## EP-006: Chemical Management

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-006** | — | **Epic** | **Chemical Management** | **—** | **—** | **—** | **Σ** |
| **US-006** | EP-006 | **User Story** | **As an admin, I want to manage chemicals so they can be tracked in log sheets** | **—** | **—** | **—** | **Σ** |
| AC-006 | US-006 | Acceptance Criteria | CRUD for chemicals with categories and units | — | — | — | Σ |
| **WP-006-001** | AC-006 | **Work Package** | **Frontend (UI/UX)** | **—** | **—** | **—** | **Σ** |
| TK-006-001 | WP-006-001 | Task | Chemicals list page with DataTable integration (src/app/(main)/chemicals/page.tsx) | 1 | 2 | 4 | 2.17 |
| TK-006-002 | WP-006-001 | Task | Chemical definition columns (name, unit, category) with actions | 1 | 1.5 | 3 | 1.67 |
| TK-006-003 | WP-006-001 | Task | ChemicalForm: creation and editing form with validation | 1.5 | 3 | 5 | 3.08 |
| TK-006-004 | WP-006-001 | Task | ChemicalDialog: wrapper for chemical CRUD forms | 0.5 | 1 | 2 | 1.08 |
| **WP-006-002** | AC-006 | **Work Package** | **Backend (Logic & APIs)** | **—** | **—** | **—** | **Σ** |
| TK-006-005 | WP-006-002 | Task | Chemicals server actions (CRUD) | 1 | 2 | 4 | 2.17 |
| TK-006-006 | WP-006-002 | Task | Chemicals service layer (Prisma queries & soft delete) | 1 | 2 | 4 | 2.17 |
| TK-006-007 | WP-006-002 | Task | Chemical uniqueness validation and category logic | 0.5 | 1 | 2 | 1.08 |

--- 

## EP-009: Parameters & Limit Profiles

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-009** | — | **Epic** | **Parameters & Limit Profiles** | **—** | **—** | **—** | **Σ** |
| **US-009-001** | EP-009 | **User Story** | **As an admin, I want to define measurement parameters so they can be used in reports** | **—** | **—** | **—** | **Σ** |
| AC-009-001 | US-009-001 | Acceptance Criteria | CRUD for parameters with variable names, units, and value types | — | — | — | Σ |
| **WP-009-001** | AC-009-001 | **Work Package** | **Frontend (Parameters UI)** | **—** | **—** | **—** | **Σ** |
| TK-009-001 | WP-009-001 | Task | Parameters management tab with DataTable (src/app/(main)/parameters/page.tsx) | 1 | 2 | 4 | 2.17 |
| TK-009-002 | WP-009-001 | Task | ParameterForm: complex form with category/type selection and metadata | 3 | 5 | 8 | 5.17 |
| TK-009-003 | WP-009-001 | Task | ParameterDialog: wrapper for creation/editing logic | 0.5 | 1 | 2 | 1.08 |
| **US-009-002** | EP-009 | **User Story** | **As an admin, I want to manage limit profiles so projects can have specific target ranges** | **—** | **—** | **—** | **Σ** |
| AC-009-002 | US-009-002 | Acceptance Criteria | Global default limits and project-specific profiles with batch updates | — | — | — | Σ |
| **WP-009-002** | AC-009-002 | **Work Package** | **Frontend (Limit Profiles UI)** | **—** | **—** | **—** | **Σ** |
| TK-009-004 | WP-009-002 | Task | Default limits editor with batch update capabilities | 2 | 4 | 7 | 4.17 |
| TK-009-005 | WP-009-002 | Task | Profiles management content (list, stats, selector) | 2 | 3 | 6 | 3.33 |
| TK-009-006 | WP-009-002 | Task | ProfileForm & Dialog for profile metadata | 1 | 2 | 4 | 2.17 |
| TK-009-007 | WP-009-002 | Task | ParameterLimitDialog for granular limit adjustments | 2 | 3 | 5 | 3.17 |
| **WP-009-003** | AC-009-002 | **Work Package** | **Backend (Logic & APIs)** | **—** | **—** | **—** | **Σ** |
| TK-009-008 | WP-009-003 | Task | Parameters server actions and CRUD service | 1.5 | 3 | 5 | 3.08 |
| TK-009-009 | WP-009-003 | Task | Limit Profiles server actions (CRUD, Batch, Copy defaults) | 2 | 4 | 8 | 4.33 |
| TK-009-010 | WP-009-003 | Task | Limit Profiles service layer with dependency injection | 3 | 5 | 9 | 5.33 |
| TK-011-011 | WP-009-003 | Task | Repository pattern for limit profiles (Prisma implementation) | 2 | 4 | 6 | 4.00 |
| TK-011-012 | WP-009-003 | Task | Batch limits upsert logic with transaction support | 1.5 | 3 | 5 | 3.08 |
| **WP-009-004** | AC-009-002 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-009-013 | WP-009-004 | Task | Limits service & utils unit tests (vitest) | 3 | 5 | 8 | 5.17 |

--- 

## EP-004: Project Management

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-004** | — | **Epic** | **Project Management** | **—** | **—** | **—** | **Σ** |
| **US-004-001** | EP-004 | **User Story** | **As an admin, I want to manage projects so I can track contracts and assignments** | **—** | **—** | **—** | **Σ** |
| AC-004-001 | US-004-001 | Acceptance Criteria | Project CRUD with status, type, and client linkage | — | — | — | Σ |
| **WP-004-001** | AC-004-001 | **Work Package** | **Frontend (UI/UX)** | **—** | **—** | **—** | **Σ** |
| TK-004-001 | WP-004-001 | Task | Projects list page with dashboard cards and DataTable (src/app/(main)/projects/page.tsx) | 2 | 4 | 7 | 4.17 |
| TK-004-002 | WP-004-001 | Task | ProjectForm: multi-section form (Meta, Machines, Assignments) | 3 | 6 | 10 | 6.17 |
| TK-004-003 | WP-004-001 | Task | Project assignments UI (user selection by role) | 2 | 3 | 5 | 3.17 |
| TK-004-004 | WP-004-001 | Task | Parameter overrides UI for project-specific limits | 2 | 4 | 6 | 4.00 |
| TK-004-005 | WP-004-001 | Task | Specialized selectors (ContractType, ProjectType, ParentSelect) | 1 | 2 | 4 | 2.17 |
| **WP-004-002** | AC-004-001 | **Work Package** | **Backend (Logic & APIs)** | **—** | **—** | **—** | **Σ** |
| TK-004-006 | WP-004-002 | Task | Projects server actions (CRUD, Assignments, Overrides) | 2 | 4 | 8 | 4.33 |
| TK-004-007 | WP-004-002 | Task | Projects service layer (complex transactions and sync logic) | 3 | 6 | 10 | 6.17 |
| TK-004-008 | WP-004-002 | Task | Access Policy: RBAC and assignment-based filtering logic | 1.5 | 3 | 5 | 3.08 |
| TK-004-009 | WP-004-002 | Task | Reporting Scope: root project and addenda hierarchy logic | 1.5 | 3 | 5 | 3.08 |
| TK-004-010 | WP-004-002 | Task | Project validation logic (Addendum constraints, status flow) | 1 | 2 | 4 | 2.17 |
| **WP-004-003** | AC-004-001 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-004-011 | WP-004-003 | Task | Project type and contract type logic unit tests | 1.5 | 3 | 5 | 3.08 |
| TK-004-012 | WP-004-003 | Task | Reporting scope hierarchy unit tests | 1.5 | 3 | 5 | 3.08 |

--- 

## EP-005: Machine Management

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-005** | — | **Epic** | **Machine Management** | **—** | **—** | **—** | **Σ** |
| **US-005-001** | EP-005 | **User Story** | **As an admin, I want to manage project machines so they can be tracked in log sheets** | **—** | **—** | **—** | **Σ** |
| AC-005-001 | US-005-001 | Acceptance Criteria | CRUD for Chillers and Cooling Towers nested within projects | — | — | — | Σ |
| **WP-005-001** | AC-005-001 | **Work Package** | **Frontend (UI/UX)** | **—** | **—** | **—** | **Σ** |
| TK-005-001 | WP-005-001 | Task | MachineFormSection: dynamic field array for project machines | 2 | 4 | 6 | 4.00 |
| TK-005-002 | WP-005-001 | Task | MachineCard: individual machine details and status editor | 1 | 2 | 4 | 2.17 |
| TK-005-003 | WP-005-001 | Task | Integration of machines within Project CRUD flow | 1 | 2 | 3 | 2.00 |
| **WP-005-002** | AC-005-001 | **Work Package** | **Backend (Logic & APIs)** | **—** | **—** | **—** | **Σ** |
| TK-005-004 | WP-005-002 | Task | Machines server actions (standalone and project-nested CRUD) | 1.5 | 3 | 5 | 3.08 |
| TK-005-005 | WP-005-002 | Task | Machines service layer (bulk creation and soft delete) | 1 | 2 | 4 | 2.17 |
| TK-005-006 | WP-005-002 | Task | Machine status and type enum handling | 0.5 | 1 | 2 | 1.08 |

--- 

## EP-007: Attendance & Absence Management

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-007** | — | **Epic** | **Attendance & Absence Management** | **—** | **—** | **—** | **Σ** |
| **US-007-001** | EP-007 | **User Story** | **As a technician, I want to clock in and out so my working hours are recorded** | **—** | **—** | **—** | **Σ** |
| AC-007-001 | US-007-001 | Acceptance Criteria | Clock in/out with browser-native camera photo capture | — | — | — | Σ |
| **WP-007-001** | AC-007-001 | **Work Package** | **Frontend (Technician UI)** | **—** | **—** | **—** | **Σ** |
| TK-007-001 | WP-007-001 | Task | Attendance dashboard for technicians (status, timers, history) | 2 | 3 | 5 | 3.17 |
| TK-007-002 | WP-007-001 | Task | Integration with CameraInput for real-time selfie capture | 1 | 2 | 4 | 2.17 |
| TK-007-003 | WP-007-001 | Task | State management for today's attendance flow (src/app/(main)/attendance/page.tsx) | 1 | 2 | 3 | 2.00 |
| **US-007-002** | EP-007 | **User Story** | **As an admin, I want to monitor technician attendance so I can review performance** | **—** | **—** | **—** | **Σ** |
| AC-007-002 | US-007-002 | Acceptance Criteria | Admin dashboard with filters, photo verification, and CSV export | — | — | — | Σ |
| **WP-007-002** | AC-007-002 | **Work Package** | **Frontend (Admin UI)** | **—** | **—** | **—** | **Σ** |
| TK-007-004 | WP-007-002 | Task | Admin attendance list with filters (date range, user) | 2 | 4 | 6 | 4.00 |
| TK-007-005 | WP-007-002 | Task | CSV export implementation for attendance reports | 1 | 2 | 3 | 2.00 |
| **WP-007-003** | AC-007-002 | **Work Package** | **Backend (Logic & APIs)** | **—** | **—** | **—** | **Σ** |
| TK-007-006 | WP-007-003 | Task | Attendance server actions (ClockIn, ClockOut, List, Export) | 2 | 3 | 5 | 3.17 |
| TK-007-007 | WP-007-003 | Task | Attendance service layer (hours calculation, Jakarta timezone logic) | 1.5 | 3 | 5 | 3.08 |
| TK-007-008 | WP-007-003 | Task | Photo upload integration with R2 for attendance proof | 1 | 2 | 4 | 2.17 |
| TK-007-009 | WP-007-003 | Task | CSV generation and escaping logic | 0.5 | 1 | 2 | 1.08 |

--- 

## EP-011: Log Sheet System

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-011** | — | **Epic** | **Log Sheet System** | **—** | **—** | **—** | **Σ** |
| **US-011-001** | EP-011 | **User Story** | **As a technician, I want to manage log sheets so I can record periodic measurement data** | **—** | **—** | **—** | **Σ** |
| AC-011-001 | US-011-001 | Acceptance Criteria | Log sheet dashboard, project-based listing, and core CRUD | — | — | — | Σ |
| **WP-011-001** | AC-011-001 | **Work Package** | **Frontend (Dashboard & List UI)** | **—** | **—** | **—** | **Σ** |
| TK-011-001 | WP-011-001 | Task | Log sheets entry page: project selection list (src/app/(main)/log-sheets/page.tsx) | 1 | 2 | 3 | 2.00 |
| TK-011-002 | WP-011-001 | Task | Project columns with links to log sheet history | 0.5 | 1 | 2 | 1.08 |
| TK-011-003 | WP-011-001 | Task | Log sheets history list by project | 1 | 2 | 4 | 2.17 |
| **WP-011-002** | AC-011-001 | **Work Package** | **Backend (Core Logic & Actions)** | **—** | **—** | **—** | **Σ** |
| TK-011-004 | WP-011-002 | Task | Log sheet server actions (CRUD, Status, Detail) | 2 | 4 | 7 | 4.17 |
| TK-011-005 | WP-011-002 | Task | Log sheet service layer (fetching, soft-delete, detail mapping) | 3 | 5 | 8 | 5.17 |
| TK-011-006 | WP-011-002 | Task | DTO mapping logic for complex log sheet relations (dto.ts) | 1 | 2 | 4 | 2.17 |
| TK-011-007 | WP-011-002 | Task | Project-based log sheet access validation | 1 | 1.5 | 3 | 1.67 |

| **US-011-002** | EP-011 | **User Story** | **As a technician, I want a reactive form context so I can enter data across multiple machine units efficiently** | **—** | **—** | **—** | **Σ** |
| AC-011-002 | US-011-002 | Acceptance Criteria | Global form state management with dynamic unit-based column generation | — | — | — | Σ |
| **WP-011-003** | AC-011-002 | **Work Package** | **Frontend (Form Management & State)** | **—** | **—** | **—** | **Σ** |
| TK-011-008 | WP-011-003 | Task | EntryStateContext: centralized state for numeric, boolean, text, and photo entries | 2 | 4 | 6 | 4.00 |
| TK-011-009 | WP-011-003 | Task | LogSheetToolbar: management of modes (Input/Preview), Print, and Status actions | 1.5 | 3 | 5 | 3.08 |
| TK-011-010 | WP-011-003 | Task | MachineSelectionPanel: interactive unit filter for dynamic form columns | 1 | 2 | 4 | 2.17 |
| TK-011-011 | WP-011-003 | Task | CategoryConfig: logic for grouping parameters by machine type (Chiller vs CT) | 0.5 | 1 | 2 | 1.08 |
| TK-011-012 | WP-011-003 | Task | useLogSheetTechnicians: hook for project personnel fetching | 0.5 | 1 | 2 | 1.08 |

| **US-011-003** | EP-011 | **User Story** | **As a technician, I want clear parameter input cells so I can record data accurately with validation feedback** | **—** | **—** | **—** | **Σ** |
| AC-011-003 | US-011-003 | Acceptance Criteria | Dynamic input types (Number, Boolean, Text) with range-based visual feedback | — | — | — | Σ |
| **WP-011-004** | AC-011-003 | **Work Package** | **Frontend (Entry Components)** | **—** | **—** | **—** | **Σ** |
| TK-011-013 | WP-011-004 | Task | ParameterInput: multi-type input cell with range-based styling (red/normal) | 2 | 4 | 6 | 4.00 |
| TK-011-014 | WP-011-004 | Task | CoolingWaterQualityDesktop: complex specialized table for CT and Raw Water columns | 2 | 3 | 5 | 3.17 |
| TK-011-015 | WP-011-004 | Task | GeneralCategoryDesktop: flexible unit-based row generation for multiple units | 1 | 2 | 4 | 2.17 |
| TK-011-016 | WP-011-004 | Task | ParameterTableRow: individual row logic for parameter names and target formatting | 1 | 1.5 | 3 | 1.67 |
| **WP-011-005** | AC-011-003 | **Work Package** | **Backend (Validation Logic)** | **—** | **—** | **—** | **Σ** |
| TK-011-017 | WP-011-005 | Task | validateNumericRange: standalone utility for multi-role limit checking | 0.5 | 1 | 2 | 1.08 |

| **US-011-004** | EP-011 | **User Story** | **As a technician, I want a mobile-optimized view so I can record data unit-by-unit during site inspections** | **—** | **—** | **—** | **Σ** |
| AC-011-004 | US-011-004 | Acceptance Criteria | Option A layout with unit overview cards and unit-specific entry screens | — | — | — | Σ |
| **WP-011-006** | AC-011-004 | **Work Package** | **Frontend (Mobile & Option A)** | **—** | **—** | **—** | **Σ** |
| TK-011-018 | WP-011-006 | Task | LogSheetUnitViewModelBuilder: complex mapper for unit-first mobile UI | 3 | 5 | 8 | 5.17 |
| TK-011-019 | WP-011-006 | Task | UnitOverviewList: dashboard cards showing completion status per unit | 1.5 | 3 | 5 | 3.08 |
| TK-011-020 | WP-011-006 | Task | UnitEntryScreen: focused input screen for a single machine unit | 2 | 4 | 6 | 4.00 |
| TK-011-021 | WP-011-006 | Task | MobileLayoutWrapper: responsive shell for technician mobile experience | 1 | 2 | 3 | 2.00 |
| TK-011-022 | WP-011-006 | Task | RawWaterInputMobile: specialized mobile input for cooling water quality | 1 | 1.5 | 3 | 1.67 |
| **WP-011-007** | AC-011-004 | **Work Package** | **Testing (Mobile Logic)** | **—** | **—** | **—** | **Σ** |
| TK-011-023 | WP-011-007 | Task | Unit view model builder unit tests (vitest) | 2 | 3 | 5 | 3.17 |

| **US-011-005** | EP-011 | **User Story** | **As a technician, I want to record chemical usage and site photos so I can document the work done** | **—** | **—** | **—** | **Σ** |
| AC-011-005 | US-011-005 | Acceptance Criteria | Chemical consumption tracking and before/after site photo documentation | — | — | — | Σ |
| **WP-011-008** | AC-011-005 | **Work Package** | **Frontend (Chemicals & Photos)** | **—** | **—** | **—** | **Σ** |
| TK-011-024 | WP-011-008 | Task | ChemicalUsageSection: interactive table for adding/removing multiple chemicals | 1.5 | 3 | 5 | 3.08 |
| TK-011-025 | WP-011-008 | Task | LogSheetPhotoSection: management of Before and After photo categories | 1 | 2 | 4 | 2.17 |
| **WP-011-009** | AC-011-005 | **Work Package** | **Backend (Chemicals & Photos Logic)** | **—** | **—** | **—** | **Σ** |
| TK-011-026 | WP-011-009 | Task | upsertLogSheetChemicalUsages: transactional logic for multi-item usage sync | 1 | 2 | 4 | 2.17 |
| TK-011-027 | WP-011-009 | Task | upsertLogSheetPhotos: sync logic for Before/After photos with R2 integration | 1 | 2 | 4 | 2.17 |

| **US-011-006** | EP-011 | **User Story** | **As a technician and client, I want to digitally sign log sheets so they can be formally submitted and approved** | **—** | **—** | **—** | **Σ** |
| AC-011-006 | US-011-006 | Acceptance Criteria | Dual-signature validation (Technician + Client) and multi-step approval workflow | — | — | — | Σ |
| **WP-011-010** | AC-011-006 | **Work Package** | **Frontend (Signatures & Workflow)** | **—** | **—** | **—** | **Σ** |
| TK-011-028 | WP-011-010 | Task | SignaturePad: browser-native drawing canvas with touch/mouse support | 2 | 3 | 5 | 3.17 |
| TK-011-029 | WP-011-010 | Task | SignatureSection: dual-role signature collection and preview UI | 1.5 | 3 | 5 | 3.08 |
| TK-011-030 | WP-011-010 | Task | Status management UI for Submit/Approve transitions | 1 | 2 | 3 | 2.00 |
| **WP-011-011** | AC-011-006 | **Work Package** | **Backend (Approval Logic)** | **—** | **—** | **—** | **Σ** |
| TK-011-031 | WP-011-011 | Task | updateLogSheetStatus: state machine logic for Draft -> Submitted -> Approved | 2 | 4 | 6 | 4.00 |
| TK-011-032 | WP-011-011 | Task | saveLogSheetSignature: secure R2 upload and user linkage for signatures | 1 | 2 | 4 | 2.17 |
| TK-011-033 | WP-011-011 | Task | validateLogSheetForSubmission: pre-flight check for signatures and ranges | 1 | 2 | 3 | 2.00 |

| **US-011-007** | EP-011 | **User Story** | **As a technician, I want to be notified of limit breaches so I can take corrective action immediately** | **—** | **—** | **—** | **Σ** |
| AC-011-007 | US-011-007 | Acceptance Criteria | Automated limit breach detection and notification for project technicians | — | — | — | Σ |
| **WP-011-012** | AC-011-007 | **Work Package** | **Backend (Limit Evaluation & Alerts)** | **—** | **—** | **—** | **Σ** |
| TK-011-034 | WP-011-012 | Task | limit-breach-adapter: mapping log sheet entries to evaluation snapshots | 1 | 2 | 3 | 2.00 |
| TK-011-035 | WP-011-012 | Task | evaluateSubmissionLimits: range checking and signature validation logic | 1 | 2 | 4 | 2.17 |
| TK-011-036 | WP-011-012 | Task | notifyLimitBreachesOnSubmission: notification orchestration and recipient logic | 1.5 | 3 | 5 | 3.08 |
| **WP-011-013** | AC-011-007 | **Work Package** | **Testing (Quality Assurance)** | **—** | **—** | **—** | **Σ** |
| TK-011-037 | WP-011-013 | Task | Log sheet service characterization and unit tests | 4 | 8 | 12 | 8.00 |
| TK-011-038 | WP-011-013 | Task | Limit breach notification unit tests (vitest) | 1 | 2 | 3 | 2.00 |

--- 

## EP-011: Work Reporting System

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-011** | — | **Epic** | **Work Reporting System** | **—** | **—** | **—** | **Σ** |
| **US-011-001** | EP-011 | **User Story** | **As a technician, I want to create work reports for ad-hoc site activities** | **—** | **—** | **—** | **Σ** |
| AC-011-001 | US-011-001 | Acceptance Criteria | Multi-section work report form with photo uploads and signatures | — | — | — | Σ |
| **WP-011-001** | AC-011-001 | **Work Package** | **Frontend (Reporting UI)** | **—** | **—** | **—** | **Σ** |
| TK-011-001 | WP-011-001 | Task | WorkReportForm: large form with dynamic machines, situations, and results | 3 | 6 | 10 | 6.17 |
| TK-011-002 | WP-011-001 | Task | WorkReportPreview: print-optimized layout for formal report viewing | 2 | 4 | 6 | 4.00 |
| TK-011-003 | WP-011-001 | Task | WorkReportSignatureSection: role-based signing UI for tech/client | 1.5 | 3 | 5 | 3.08 |
| TK-011-004 | WP-011-001 | Task | Work reports project selection and history list (src/app/(main)/work-reports/page.tsx) | 1 | 2 | 3 | 2.00 |
| **WP-011-002** | AC-011-001 | **Work Package** | **Backend (Reporting Logic)** | **—** | **—** | **—** | **Σ** |
| TK-011-005 | WP-011-002 | Task | Work reports server actions (transactional photo/report creation) | 2 | 4 | 7 | 4.17 |
| TK-011-006 | WP-011-002 | Task | Work reports service layer (Prisma relations and soft-delete) | 1.5 | 3 | 5 | 3.08 |
| TK-011-007 | WP-011-002 | Task | WorkReportSignatureModule: domain-driven signature handling logic | 2 | 4 | 6 | 4.00 |
| TK-011-008 | WP-011-002 | Task | StatusPolicy: state machine for report approval flow | 1 | 2 | 3 | 2.00 |
| TK-011-009 | WP-011-002 | Task | R2 storage integration for report photos and signatures | 1 | 1.5 | 3 | 1.67 |
| **WP-011-003** | AC-011-001 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-011-010 | WP-011-003 | Task | Signature module and repository unit tests | 2 | 4 | 6 | 4.00 |
| TK-011-011 | WP-011-003 | Task | Status transition and visibility unit tests | 1 | 2 | 3 | 2.00 |

--- 

## EP-008: Lab Analysis Tracking

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-008** | — | **Epic** | **Lab Analysis Tracking** | **—** | **—** | **—** | **Σ** |
| **US-008-001** | EP-008 | **User Story** | **As a technician, I want to record detailed lab analysis results for water quality monitoring** | **—** | **—** | **—** | **Σ** |
| AC-008-001 | US-008-001 | Acceptance Criteria | Detailed results tracking with dynamic columns and formal print layout | — | — | — | Σ |
| **WP-008-001** | AC-008-001 | **Work Package** | **Frontend (Lab Analysis UI)** | **—** | **—** | **—** | **Σ** |
| TK-008-001 | WP-008-001 | Task | LabAnalysisForm: complex form with dynamic column addition and entry mapping | 3 | 5 | 8 | 5.17 |
| TK-008-002 | WP-008-001 | Task | LabAnalysisPrint: formal report layout with CC, attention, and remarks fields | 2 | 3 | 5 | 3.17 |
| TK-008-003 | WP-008-001 | Task | Lab analyses project list and historical overview (src/app/(main)/lab-analyses/page.tsx) | 1 | 2 | 3 | 2.00 |
| **WP-008-002** | AC-008-001 | **Work Package** | **Backend (Lab Analysis Logic)** | **—** | **—** | **—** | **Σ** |
| TK-008-004 | WP-008-002 | Task | Lab analyses server actions (CRUD and Detail fetching) | 1.5 | 3 | 5 | 3.08 |
| TK-008-005 | WP-008-002 | Task | Lab analyses service layer (complex transactions for columns/entries) | 3 | 5 | 9 | 5.33 |
| TK-008-006 | WP-008-002 | Task | Dynamic column synchronization and soft-delete logic | 1.5 | 3 | 5 | 3.08 |
| TK-008-007 | WP-008-002 | Task | Lab analysis header normalization and cleanup logic | 0.5 | 1 | 2 | 1.08 |

--- 

## EP-012: Monthly Summary Reporting

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-012** | — | **Epic** | **Monthly Summary Reporting** | **—** | **—** | **—** | **Σ** |
| **US-012-001** | EP-012 | **User Story** | **As a reporting officer, I want to generate monthly summary reports for clients** | **—** | **—** | **—** | **Σ** |
| AC-012-001 | US-012-001 | Acceptance Criteria | Orchestrated report generation with TOC, chapters, and client attachments | — | — | — | Σ |
| **WP-012-001** | AC-012-001 | **Work Package** | **Frontend (Reporting UI)** | **—** | **—** | **—** | **Σ** |
| TK-012-001 | WP-012-001 | Task | SummaryReportsPage: project/period selection and chapter toggles | 2 | 3 | 5 | 3.17 |
| TK-012-002 | WP-012-001 | Task | SummaryReportPrintPage: formal multi-chapter layout with TOC | 3 | 5 | 8 | 5.17 |
| TK-012-003 | WP-012-001 | Task | SummaryReportAttachments: separate pack for PDF/Image attachments | 1 | 2 | 4 | 2.17 |
| TK-012-004 | WP-012-001 | Task | Executive Summary: automatic data aggregation dashboard for reports | 1.5 | 3 | 5 | 3.08 |
| **WP-012-002** | AC-012-001 | **Work Package** | **Backend (Aggregation Logic)** | **—** | **—** | **—** | **Σ** |
| TK-012-005 | WP-012-002 | Task | Summary reports server actions (transactional creation & attachments) | 2 | 4 | 6 | 4.00 |
| TK-012-006 | WP-012-002 | Task | Aggregation service: fetching monthly logs, lab data, and work reports | 2 | 4 | 7 | 4.17 |
| TK-012-007 | WP-012-002 | Task | Chemical usage summary calculator for Chapter V | 1 | 1.5 | 3 | 1.67 |
| TK-012-008 | WP-012-002 | Task | R2 storage integration for external report attachments | 1 | 2 | 3 | 2.00 |

--- 

## EP-013: Notification System

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-013** | — | **Epic** | **Notification System** | **—** | **—** | **—** | **Σ** |
| **US-013-001** | EP-013 | **User Story** | **As a user, I want to receive real-time alerts for critical system events** | **—** | **—** | **—** | **Σ** |
| AC-013-001 | US-013-001 | Acceptance Criteria | Notification bell with unread count and item list with Read/Unread state | — | — | — | Σ |
| **WP-013-001** | AC-013-001 | **Work Package** | **Frontend (Alerts UI)** | **—** | **—** | **—** | **Σ** |
| TK-013-001 | WP-013-001 | Task | NotificationBell: UI component for the navbar with real-time unread badge | 1 | 2 | 3 | 2.00 |
| TK-013-002 | WP-013-001 | Task | NotificationItem: layout for individual alerts by severity (INFO/WARNING/CRITICAL) | 0.5 | 1 | 2 | 1.08 |
| TK-013-003 | WP-013-001 | Task | useNotifications: client-side hook for polling/fetching alerts | 1 | 2 | 4 | 2.17 |
| **WP-013-002** | AC-013-001 | **Work Package** | **Backend (Alerts Logic)** | **—** | **—** | **—** | **Σ** |
| TK-013-004 | WP-013-002 | Task | Notifications server actions (List, Read, Mark All) | 1 | 2 | 4 | 2.17 |
| TK-013-005 | WP-013-002 | Task | NotificationService: core business logic for evaluation and dispatch | 2 | 3 | 5 | 3.17 |
| TK-013-006 | WP-013-002 | Task | LimitBreachDetector: rules engine for identifying out-of-range parameters | 1.5 | 3 | 5 | 3.08 |
| TK-013-007 | WP-013-002 | Task | NotificationRepository: Prisma implementation for persistent storage | 1.5 | 2 | 4 | 2.33 |
| **WP-013-003** | AC-013-001 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-013-008 | WP-013-003 | Task | Notification service and detector unit tests | 1.5 | 3 | 5 | 3.08 |

--- 

## EP-014: Analytics & Dashboard

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-014** | — | **Epic** | **Analytics & Dashboard** | **—** | **—** | **—** | **Σ** |
| **US-014-001** | EP-014 | **User Story** | **As a manager, I want to see visual trends of chiller performance to identify potential issues** | **—** | **—** | **—** | **Σ** |
| AC-014-001 | US-014-001 | Acceptance Criteria | Analytics dashboard with time-series charts for Approach and Ampere metrics | — | — | — | Σ |
| **WP-014-001** | AC-014-001 | **Work Package** | **Frontend (Analytics UI)** | **—** | **—** | **—** | **Σ** |
| TK-014-001 | WP-014-001 | Task | MetricLineChart: reusable Recharts component for time-series data | 2 | 3 | 5 | 3.17 |
| TK-014-002 | WP-014-001 | Task | AnalyticsDashboard: container for approach/ampere trends and photo gallery | 1.5 | 3 | 5 | 3.08 |
| TK-014-003 | WP-014-001 | Task | RecentPhotosGallery: grid view of latest site documentation photos | 1 | 2 | 3 | 2.00 |
| TK-014-004 | WP-014-001 | Task | DashboardScoped: project-filtered view for technicians and clients | 1.5 | 2 | 4 | 2.33 |
| **WP-014-002** | AC-014-001 | **Work Package** | **Backend (Analytics Logic)** | **—** | **—** | **—** | **Σ** |
| TK-014-005 | WP-014-002 | Task | Dashboard server actions (Metrics, Photos) with role-based scoping | 1 | 2 | 4 | 2.17 |
| TK-014-006 | WP-014-002 | Task | getDashboardMetrics: aggregation logic for log sheet parameter trends | 2 | 4 | 6 | 4.00 |
| TK-014-007 | WP-014-002 | Task | getRecentLogSheetPhotos: fetching and filtering latest project photos | 1 | 1.5 | 3 | 1.67 |

--- 

## EP-015: User Profile & Client Portal

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-015** | — | **Epic** | **User Profile & Client Portal** | **—** | **—** | **—** | **Σ** |
| **US-015-001** | EP-015 | **User Story** | **As a user, I want to manage my personal profile and view assigned projects** | **—** | **—** | **—** | **Σ** |
| AC-015-001 | US-015-001 | Acceptance Criteria | Self-service profile management and read-only project details for technicians/clients | — | — | — | Σ |
| **WP-015-001** | AC-015-001 | **Work Package** | **Frontend (Portal UI)** | **—** | **—** | **—** | **Σ** |
| TK-015-001 | WP-015-001 | Task | MyProfilePage: interactive form for personal data and avatar updates | 1 | 2 | 3 | 2.00 |
| TK-015-002 | WP-015-001 | Task | MyProjectPage: read-only summary and task shortcuts for assigned projects | 1 | 2 | 3 | 2.00 |
| TK-015-003 | WP-015-001 | Task | ForbiddenPage: generic fallback UI for unauthorized access attempts | 0.5 | 1 | 2 | 1.08 |
| **WP-015-002** | AC-015-001 | **Work Package** | **Backend (Portal Logic)** | **—** | **—** | **—** | **Σ** |
| TK-015-004 | WP-015-002 | Task | Profile server actions (Get, Update) with session validation | 1 | 1.5 | 3 | 1.67 |
| TK-015-005 | WP-015-002 | Task | Project detail fetching logic with RBAC-safe includes | 1 | 1.5 | 3 | 1.67 |

--- 

## EP-017: Static Assets Infrastructure (Cloudflare)

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-017** | — | **Epic** | **Static Assets Infrastructure** | **—** | **—** | **—** | **Σ** |
| **US-017-001** | EP-017 | **User Story** | **As a developer, I want a dedicated asset worker to handle secure R2 uploads and serving** | **—** | **—** | **—** | **Σ** |
| AC-017-001 | US-017-001 | Acceptance Criteria | Cloudflare Worker with R2 bucket binding and Bearer Token authentication | — | — | — | Σ |
| **WP-017-001** | AC-017-001 | **Work Package** | **Worker Implementation** | **—** | **—** | **—** | **Σ** |
| TK-017-001 | WP-017-001 | Task | Asset Worker: implementation of GET/PUT/DELETE handlers for R2 objects | 1 | 2 | 4 | 2.17 |
| TK-017-002 | WP-017-001 | Task | Bearer Token security middleware for write operations | 0.5 | 1 | 2 | 1.08 |
| TK-017-003 | WP-017-001 | Task | CORS preflight and headers handling for frontend integration | 0.5 | 1 | 2 | 1.08 |
| **WP-017-002** | AC-017-001 | **Work Package** | **DevOps & Infrastructure** | **—** | **—** | **—** | **Σ** |
| TK-017-004 | WP-017-002 | Task | Wrangler configuration for dev/staging/prod environments | 1 | 2 | 3 | 2.00 |
| TK-017-005 | WP-017-002 | Task | R2 bucket creation and binding setup | 0.5 | 1 | 2 | 1.08 |

--- 

## EP-016: Infrastructure & Foundation (DevOps & Quality)

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-016** | — | **Epic** | **Infrastructure & Foundation** | **—** | **—** | **—** | **Σ** |
| **US-016-004** | EP-016 | **User Story** | **As a developer, I want automated environment setup and quality gates to ensure consistent code standards** | **—** | **—** | **—** | **Σ** |
| AC-016-004 | US-016-004 | Acceptance Criteria | Automated seeding scripts and git hooks for linting/commit validation | — | — | — | Σ |
| **WP-016-004** | AC-016-004 | **Work Package** | **DevOps (Data & Quality)** | **—** | **—** | **—** | **Σ** |
| TK-016-028 | WP-016-004 | Task | Database Seeding: default system parameters and admin user setup | 1 | 2 | 4 | 2.17 |
| TK-016-029 | WP-016-004 | Task | Seed Export/Import: automated data portability scripts (seed-export.ts) | 1.5 | 3 | 5 | 3.08 |
| TK-016-030 | WP-016-004 | Task | Husky & lint-staged: pre-commit hooks for automated formatting/linting | 1 | 1.5 | 3 | 1.67 |
| TK-016-031 | WP-016-004 | Task | Commitlint: enforcement of conventional commit message standards | 0.5 | 1 | 2 | 1.08 |
| TK-016-032 | WP-016-004 | Task | ESLint & Prettier: configuration for strict TypeScript and React rules | 1 | 2 | 3 | 2.00 |
| TK-016-033 | WP-016-004 | Task | Package & TypeScript config for Monorepo-style source management | 1 | 2 | 4 | 2.17 |

--- 

## EP-016: Infrastructure & Foundation (QA & Testing)

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **US-016-005** | EP-016 | **User Story** | **As a developer, I want a comprehensive test suite to prevent regressions in complex business logic** | **—** | **—** | **—** | **Σ** |
| AC-016-005 | US-016-005 | Acceptance Criteria | Centralized Vitest setup and automated coverage for core services | — | — | — | Σ |
| **WP-016-005** | AC-016-005 | **Work Package** | **Quality Assurance (Testing)** | **—** | **—** | **—** | **Σ** |
| TK-016-034 | WP-016-005 | Task | Vitest global setup: DOM mocks, React Testing Library, and Prisma mocks | 1.5 | 3 | 5 | 3.08 |
| TK-016-035 | WP-016-005 | Task | Log Sheet characterization tests: 2500+ lines of complex logic coverage | 4 | 8 | 12 | 8.00 |
| TK-016-036 | WP-016-005 | Task | Work Report signature and repository integration tests | 2 | 4 | 6 | 4.00 |
| TK-016-037 | WP-016-005 | Task | RBAC and Auth helper security policy unit tests | 1.5 | 3 | 5 | 3.08 |
| TK-016-038 | WP-016-005 | Task | Playwright E2E configuration for critical user flows | 2 | 4 | 8 | 4.33 |
