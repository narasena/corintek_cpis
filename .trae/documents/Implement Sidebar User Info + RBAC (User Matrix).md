## Scope
- Implement “logged-in user info” in sidebar/footer (name, email, role, avatar) using the existing auth cookie + user table.
- Implement RBAC based on FSD Section 10 “User Matrix” and ROADMAP scope `AC-01`.

## Inputs (Source of Truth)
- User Matrix: [FSD_CPIS.md](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/fsd_cpis/FSD_CPIS.md#L630-L641)
- Roadmap task: [ROADMAP.md](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/ROADMAP.md#L329-L334)
- Current auth/session:
  - Cookie login: [auth/actions.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/auth/actions.ts#L18-L68)
  - Middleware auth gate: [middleware.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/middleware.ts#L1-L66)
  - Server helper: [auth-helpers.ts](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/lib/auth-helpers.ts#L1-L33)
- Current sidebar is hardcoded: [app-sidebar.tsx](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/components/app-sidebar.tsx#L31-L95)

## Key Design Decisions
## 1) RBAC “Policy First”, Enforce in 3 Layers
- **UI (navigation/CTA hiding):** prevent users from seeing links/buttons they cannot use.
- **Middleware (route gate):** prevent direct URL access to restricted pages.
- **Service layer (authoritative):** prevent unauthorized CRUD even if a request bypasses UI/middleware (per project guideline: role checks in `service.ts`).

## 2) Role Mapping Strategy (FSD vs Current Enum)
- Current Prisma enum: `ADMIN | SUPERVISOR | TECHNICIAN | DIRECTOR | CLIENT_TECHNICIAN | CLIENT_SUPERVISOR` in [users.prisma](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/prisma/schema/users.prisma#L35-L42)
- FSD roles: `Super Admin | PIC Project | Teknisi | Reporting | Direksi | Klien`.

Recommended implementation path:
- **Keep existing roles** (minimize schema churn) but implement an RBAC matrix that matches FSD intent:
  - `ADMIN` => Super Admin (CRUD all)
  - `SUPERVISOR` => PIC Project (CRUD on allowed modules)
  - `TECHNICIAN` and `CLIENT_TECHNICIAN` => Teknisi (CRU on allowed modules)
  - `DIRECTOR` => Direksi (R)
  - `CLIENT_SUPERVISOR` => Klien (R)
- **Add `REPORTING` role** only if needed immediately (because FSD has it and it has unique access). This requires a Prisma enum change + migration + updating `src/@types/user.type.ts` and any role dropdowns.

## Implementation Steps
## 1) Define Central RBAC Matrix + Route Map
Create a single source of truth module:
- New: `src/lib/rbac.ts`
  - Define `TRbacResource` (ex: `DASHBOARD | SUMMARY_REPORTS | LOG_SHEETS | REPORTS | LAB_ANALYSES | ATTENDANCE | USERS_ADMIN | PROJECTS_ADMIN | MASTER_DATA`)
  - Define capability flags `{ create, read, update, delete }`.
  - Encode the FSD matrix into capabilities per role.
  - Export helpers:
    - `canAccess(role, resource, capability)`
    - `filterNavItems(role, items)`
    - `matchPathToResource(pathname)` for middleware/layout.

Notes for mapping resources → current routes:
- `DASHBOARD` => `/`
- `SUMMARY_REPORTS` => `/summary-reports`
- `LOG_SHEETS` => `/log-sheets`
- `REPORTS` (View Reports) => `/reports`
- `LAB_ANALYSES` => `/lab-analyses`
- `ATTENDANCE` => `/attendance`
- `USERS_ADMIN` => `/users`
- `PROJECTS_ADMIN` => `/projects`
- `MASTER_DATA` => `/clients`, `/chemicals`, `/parameters`, `/machines`

## 2) Implement “Current User (Display)” Fetching
Goal: sidebar shows real logged-in user, not the hardcoded placeholder.
- Extend server-side auth helpers:
  - Update `src/lib/auth-helpers.ts` to add `getCurrentUserDetails()`:
    - Read/verify cookie (existing `getCurrentUser()`)
    - Fetch user from Prisma by `id` to get `firstName`, `lastName`, `email`, `avatarUrl`, `role`, and status flags (`isActive`, `isBlocked`, `deletedAt`).
    - If user invalid/blocked/deleted: treat as unauthenticated (and optionally clear cookie in a follow-up).

## 3) Wire Sidebar + Mobile Nav to Real User + RBAC-filtered Menus
- Update `src/app/(main)/layout.tsx` (server component) to:
  - Call `getCurrentUserDetails()` once.
  - Build the nav config list (the list currently embedded in `AppSidebar`).
  - Filter nav items by role using RBAC helpers.
  - Pass `{ user, navItems }` props into:
    - `AppSidebar`
    - `MobileNav`
- Refactor `src/components/app-sidebar.tsx` to accept props instead of hardcoded `data`.
- Update `src/components/mobile-nav.tsx` to accept role-filtered links (or accept the same `navItems` and render a small subset).
- Update `src/components/nav-user.tsx`:
  - Show role label (e.g., “ADMIN / SUPERVISOR / …” mapped to friendly text).
  - Wire “Log out” to `logoutAction()`.
  - Remove/disable placeholder menu items that are not implemented (Upgrade/Billing/Notifications) to avoid dead UI.

## 4) Add Middleware Role Checks (Coarse Route Gate)
- Update `src/middleware.ts`:
  - After verifying token, decode role (reuse `verifyToken()` result).
  - Map `pathname` → RBAC resource.
  - If resource is not allowed for the role, redirect to a single safe page:
    - New page: `src/app/(main)/forbidden/page.tsx` (simple “Akses ditolak”).

Why coarse only: middleware can’t query DB; service layer remains the authoritative gate.

## 5) Enforce RBAC in Service Layer (Authoritative)
- For each feature that mutates data, update service signatures to include `actor: IJwtPayload` (or a user-details type) and call RBAC helpers:
  - Users: `src/features/users/service.ts` (restrict CRUD to ADMIN only per matrix)
  - Projects: `src/features/projects/service.ts` (ADMIN + SUPERVISOR CRUD; TECHNICIAN read only if allowed)
  - Master data: `clients`, `chemicals`, `parameters`, `machines` services (ADMIN only per matrix; SUPERVISOR denied)
  - Summary Reports: enforce “finalize to FINAL” only for Reporting role (if added) / otherwise ADMIN+SUPERVISOR (depending on your intended business rule).
  - Delete operations: enforce “CRU” roles cannot delete.
- Update the corresponding server actions (`src/features/*/actions.ts`) to:
  - `const actor = await getCurrentUser(); if (!actor) return { error: 'Unauthorized' }`
  - Pass `actor` into service calls.
  - Ensure the standard logging pattern on catch blocks (`[CPIS-ERROR] Feature.Action:`).

## 6) Page-Level Guard (Server Component Safety Net)
- For pages that display admin-only screens (e.g., `/users`, `/clients`, `/chemicals`, `/parameters`, `/machines`):
  - Add a tiny guard at the top of `page.tsx` (server) using `getCurrentUser()` + RBAC check.
  - Redirect to `/forbidden` if not allowed.

## Verification Plan
- Manual test matrix (at least 1 account per role):
  - Sidebar shows correct name/email/role.
  - Direct URL access blocked by middleware (e.g., TECHNICIAN going to `/users`).
  - Server Actions reject unauthorized CRUD (attempt create/delete as read-only role).
  - “Log out” clears cookie and returns to `/login`.
- Regression check: login redirect behavior still works (`/login` redirects to `/users` today; may update to `/` if dashboard becomes the real landing page).

## Deliverables (Concrete)
- Real user display in sidebar + working logout.
- RBAC navigation filtering.
- Middleware route-gating by role.
- Service-layer authorization for CRUD according to the matrix.
- `/forbidden` page for consistent UX when blocked.
