## Current State (What Exists)
- Dashboard already routes scoped roles (SUPERVISOR/TECHNICIAN/CLIENT_*) to a project-card view and uses `getProjects()` which filters to assigned ONGOING projects.
- The scoped dashboard cards currently show generic module buttons and contain a broken link to `/projects/[id]` (blocked by RBAC and no page exists).
- Log Sheets already have `DRAFT/SUBMITTED/APPROVED` statuses, but status updates are not role-restricted (a TECHNICIAN can set APPROVED today).
- Work Reports have no status/draft/approval workflow and several pages call the WorkReport service directly without project scoping checks.

## Goals (From Your Request)
- Auto-filter dashboard on launch to show only active internal projects per role (no manual search).
- Mobile-first project cards:
  - TECHNICIAN: show assignment scope + one-tap actions to create Log Sheet and start a Work Report.
  - PIC (SUPERVISOR): show scope + create actions + view/approve Log Sheet drafts + view/approve Work Report drafts.
- Enforce permissions and keep project/task status “live” via revalidation + lightweight refresh.
- Seamless navigation between project overview ↔ task workflows.

## Plan
### 1) Add a Non-Admin Project Overview Route
- Add a new route: `src/app/(main)/my-projects/[projectId]/page.tsx`.
- Update RBAC path mapping so `/my-projects` maps to `PROJECTS_LIST` (not `PROJECTS_ADMIN`).
- Update the dashboard “detail” link to `/my-projects/[id]`.

### 2) Extend Project Fetching for “Scope” on Cards
- Add a dashboard-specific return type (e.g. `IProjectDashboardCard`) containing:
  - project basics (id, name, client, status)
  - the current user’s assignment role(s) in that project (`PROJECT_PIC` / `TECHNICIAN`)
  - per-project task summary counts needed for cards (pending approvals, drafts)
- Implement this in the Projects service with Prisma includes filtered to `assignments: { where: { userId: actor.id, isActive: true } }`.

### 3) Log Sheet Approval Workflow (Permission-Safe)
- Add explicit server actions for transitions (instead of letting any updater set any status):
  - TECHNICIAN: `DRAFT → SUBMITTED`
  - PIC (SUPERVISOR with PROJECT_PIC assignment) / ADMIN: `SUBMITTED → APPROVED`
- Enforce transitions in the service layer using actor + assignment role checks.
- Add `revalidatePath('/')` and `revalidatePath('/my-projects/[projectId]')` on create/submit/approve so dashboard cards update after actions.

### 4) Work Report Draft + Approval Workflow (New)
- Prisma changes:
  - Add `WorkReportStatus` enum (`DRAFT`, `SUBMITTED`, `APPROVED`).
  - Add `status` field (default `DRAFT`) and optional `approvedAt`, `approvedByUserId`.
- Update Work Report Zod schemas and types to include `status`.
- Add server actions for submit/approve similar to Log Sheets.
- Update UI:
  - Work report form: allow “Simpan Draft” and “Kirim ke PIC”.
  - PIC approvals: one-tap “Setujui” from the project overview approvals section.

### 5) Fix Work Report Scoping (Security)
- Stop calling WorkReport service directly from pages without actor/project checks.
- Use server actions (or actor-aware service wrappers) that always call `projectService.assertCanAccessProject(actor, projectId)`.
- Apply this to:
  - `src/app/(main)/work-reports/[projectId]/page.tsx`
  - `src/app/(main)/work-reports/[projectId]/[workReportId]/page.tsx`

### 6) Mobile-First Project Cards + One-Tap Actions
- Convert `DashboardScoped` into a client component that:
  - renders a tap-friendly project card layout
  - shows scope chips (TECHNICIAN vs PIC) and status badge
  - provides one-tap actions:
    - TECHNICIAN: “Buat Log Sheet (Hari ini)”, “Buat Laporan Kerja”
    - PIC: same + “Persetujuan Log Sheet (N)”, “Persetujuan Laporan Kerja (N)”
  - refreshes data via a small dashboard server action (poll on focus + short interval) to keep counts/status current.

### 7) Seamless Navigation
- On task pages (log sheets / work reports), add consistent “Kembali ke Proyek” link to `/my-projects/[projectId]`.
- In `/my-projects/[projectId]`, show contextual action cards and an approvals panel for PIC.

## Verification (After Implementation)
- TECHNICIAN login:
  - Dashboard shows only assigned ONGOING projects.
  - Can create Log Sheet and submit; cannot approve.
  - Cannot access other project IDs via URL.
- PIC login:
  - Dashboard shows assigned ONGOING projects.
  - Sees pending approval counts and can approve; counts update immediately.
- Admin assignment/status change triggers dashboard updates (via revalidation).

## Files Expected to Change
- RBAC routing: `src/lib/rbac.ts`
- Dashboard: `src/app/(main)/page.tsx`, `src/app/(main)/components/dashboard-scoped.tsx`
- New project overview route: `src/app/(main)/my-projects/[projectId]/page.tsx`
- Log sheets: `src/features/log-sheets/actions.ts`, `src/features/log-sheets/service.ts` (+ optional prisma fields)
- Work reports: `prisma/schema/work-reports.prisma`, `src/features/work-reports/*`, and `src/app/(main)/work-reports/**`
- Projects assignments revalidation: `src/features/projects/actions.ts`

If you confirm this plan, I’ll implement it in the repo (including the Prisma migration for Work Report status + approvals) following the existing Server Actions → Service → Prisma pattern and the toast/UI standards.