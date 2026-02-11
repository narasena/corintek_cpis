## Goal
- For PIC Project (SUPERVISOR), Technician (TECHNICIAN/CLIENT_TECHNICIAN), and Client PIC (CLIENT_SUPERVISOR): only show + allow access to the user’s currently active assigned project(s), and only if the user is still active.
- Prevent viewing/operating on other projects’ data even by URL guessing.

## Current State (What’s broken)
- `getProjectsAction()` returns **all non-deleted projects** to every role with `PROJECTS_LIST: read`.
- Many feature server actions (log sheets, work reports, lab analyses) have **no auth/RBAC** and accept `projectId` directly, so a user can access other projects by ID.
- There is **no assignment relationship** in the DB schema between Users and Projects, so “assigned project” cannot be enforced today.

## Data Model (Prisma)
- Add a join model for assignments (in `prisma/schema/projects.prisma` and a backrelation in `prisma/schema/users.prisma`):
  - `ProjectAssignment` (or `ProjectMember`) fields:
    - `id`, `projectId`, `userId`
    - `role` (enum: `PROJECT_PIC`, `TECHNICIAN`, `CLIENT_PIC`)
    - `isActive` (default true), optional `startDate`, `endDate`
    - timestamps + `@@index([projectId])`, `@@index([userId])`, `@@unique([projectId, userId, role])`
  - Add relations: `Project.assignments[]`, `User.projectAssignments[]`
- Run a Prisma migration to create the table.

## Backend Enforcement (Server Actions → Service)
- Create a single, reusable access helper in the Projects domain:
  - `getAccessibleProjectIds(actor)`
  - `assertCanAccessProject(actor, projectId)`
  - “Active project” definition: `deletedAt = null` AND `status = ONGOING` (can be expanded later).
- Update auth usage:
  - Prefer `getCurrentUserDetails()` (enforces `isActive && !isBlocked && !deletedAt`) for all sensitive actions.

### Project listing scoping
- Update `getProjectsAction()` / `projectService.getProjects()` to accept `actor` and apply scoping:
  - `ADMIN`: all non-deleted projects
  - `REPORTING` + `DIRECTOR`: keep current behavior (all non-deleted) unless you want them scoped too
  - `SUPERVISOR`, `TECHNICIAN`, `CLIENT_SUPERVISOR`, `CLIENT_TECHNICIAN`: only projects where:
    - assignment exists for `actor.id` with `isActive = true`
    - project status is active (ONGOING)

### Prevent URL guessing across modules
- Add `assertCanAccessProject(actor, projectId)` to every action that takes a `projectId`, including:
  - `log-sheets`: list by project, create, update, delete, save entries/photos/chemicals
  - `work-reports`: list by project, create/update/delete
  - `lab-analyses`: list by project, create/update
  - `summary-reports`: create/update/get by period/list
- For actions that take only a record ID (e.g., `getLogSheetDetailAction(id)` / `getWorkReportByIdAction(id)`):
  - Fetch the record first → read its `projectId` → call `assertCanAccessProject(actor, projectId)` → then return the data.

## RBAC Matrix Cleanup
- Update `ROLE_MATRIX` so SUPERVISOR is no longer allowed to open `/projects` management UI:
  - Set `SUPERVISOR.PROJECTS_ADMIN = '-'` (keep `PROJECTS_LIST: 'R'`)
  - Keep `PROJECTS_ADMIN` for `ADMIN` only
- This prevents “PIC Project” from seeing the full project admin table.

## Admin UI to Manage Assignments (Needed so scoping is usable)
- Extend the existing Projects admin flow (no new pages):
  - In the “Ubah Data Proyek” dialog, add a “Penugasan” section:
    - PIC Project (single select user)
    - Teknisi (multi-select)
    - PIC Klien (single select user)
    - Only show active users; save via new server action(s).
  - Add toast success/error on save.
- Implement server actions in `src/features/projects/actions.ts`:
  - `getProjectAssignmentsAction(projectId)`
  - `setProjectAssignmentsAction(projectId, assignments)` (upsert + deactivate removed)
- Implement service functions in `src/features/projects/service.ts` to do the Prisma upsert/deactivate logic.

## Verification
- Manual checks:
  - As SUPERVISOR/TECHNICIAN/CLIENT roles: project pickers in Work Reports / Log Sheets / Summary Reports only show assigned ONGOING projects.
  - Direct URL to another project’s page results in “Unauthorized / Forbidden” response from server actions.
  - As ADMIN: can still see all projects and can set assignments in project edit dialog.
- Add a small service-layer test (only if business rule logic gets non-trivial), otherwise manual verification.

## Deliverables (Files likely touched)
- Prisma: `prisma/schema/projects.prisma`, `prisma/schema/users.prisma` + migration
- Projects: `src/features/projects/actions.ts`, `src/features/projects/service.ts`, `src/features/projects/types.ts`
- Feature actions: `src/features/log-sheets/actions.ts`, `src/features/work-reports/actions.ts`, `src/features/lab-analyses/actions.ts`, `src/features/summary-reports/actions.ts`
- Projects UI: `src/app/(main)/projects/components/project-form.tsx` (assignment fields) and any required shared UI inputs
