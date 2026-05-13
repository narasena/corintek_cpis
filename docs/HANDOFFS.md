# Session Handoff — 2026-05-13 (Attendance Role-Based Access & Project Filter)

**Branch:** `fix/absence-list`

### Completed This Session

| Task                                                                            | Status      |
| ------------------------------------------------------------------------------- | ----------- |
| Add `projectId` filter to attendance schema and services                        | ✅ Complete |
| Extend `listAttendance` and buildWhereClause with project-based user filtering  | ✅ Complete |
| Add project dropdown to admin page, fetch projects, integrate with filters      | ✅ Complete |
| Add admin route guard using `useSession`                                        | ✅ Complete |
| Redirect ADMIN from main page to admin page; block CLIENT_SUPERVISOR with toast | ✅ Complete |
| Unit test for projectId filter in attendance-service.test.ts                    | ✅ Complete |
| E2E tests: create access-control.spec.ts + supervisor.setup.ts                  | ✅ Complete |
| Update Playwright config for attendance test project                            | ✅ Complete |
| Documentation: DECISIONS, CHANGELOG, HANDOFFS                                   | ✅ Complete |

### Objective

Restrict attendance features based on user roles with immutable records:

- **ADMIN**: Admin-only view with date, technician, and **project filters**; CSV export respects filters.
- **SUPERVISOR**: Read-only table of assigned technicians.
- **TECHNICIAN**: Clock in/out + own history.
- **CLIENT_SUPERVISOR**: No access — redirect to home with error toast.

### Key Changes

**Schema & Types**

- `src/features/attendance/types.ts`: Add `projectId: z.string().uuid().optional()` to `attendanceListFiltersSchema`.

**Service Layer**

- `src/features/attendance/service.ts`: Extend `listAttendance` where clause to join through `ProjectAssignment`:
  ```ts
  ...(filters.projectId ? { user: { projectAssignments: { some: { projectId, role: 'TECHNICIAN' } } } } : {})
  ```
- `src/features/attendance/attendance-service.ts`: Same filter added to `buildWhereClause`; typed where as `Prisma.AttendanceWhereInput` to satisfy TS.

**Admin Page: Guards & Filters**

- `src/app/(main)/attendance/admin/page.tsx`:
  - Use `useSession` hook; guard redirects non-ADMIN.
  - State: `projectId` added; fetch projects via `getProjectsAction`.
  - UI: Project dropdown ("Semua Proyek") alongside date range and technician filter.
  - `fetchAttendance` and `handleExport` now include `projectId`.
  - `canReset` and `resetFilters` handle all three filters.

**Main Attendance Page**

- `src/app/(main)/attendance/page.tsx`:
  - Early ADMIN redirect to `/attendance/admin`.
  - CLIENT_SUPERVISOR block with toast error and redirect to `/`.

**Tests**

- `src/features/attendance/attendance-service.test.ts`: Added test verifying `projectId` some-join condition.
- `src/__tests__/e2e/attendance/access-control.spec.ts`: New E2E spec covering all role access patterns.
- `src/__tests__/e2e/auth/supervisor.setup.ts`: Auth helper for SUPERVISOR role.
- `playwright.config.ts`: Added `attendance:access-control` project depending on all four auth setups.

### Verification

- Build: `npm run build` passes cleanly.
- TypeScript: No new errors in modified files.
- Project filter: Admins can select a project to restrict technician list to those assigned as `TECHNICIAN` in that project.
- CSV export: Includes current filtered rows.

---
