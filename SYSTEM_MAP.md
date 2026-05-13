# CPIS — System Architecture Map

> **Last Updated:** 2026-05-13
> **Purpose:** Orientation guide for agents working on the CPIS codebase

---

## 1. Project Summary

CPIS (Corintek Project Information System) is a field service management web application built with Next.js 16 (App Router) and React 19. It manages HVAC/chiller operations for facility management, tracking log sheets, work reports, lab analyses, attendance, and projects. The system supports role-based access for internal users and read-only Client portal users. Data persisted via Prisma ORM to PostgreSQL with mobile-first responsive design.

---

## 2. Core Architecture Flow

### Standard User Flow

`Trigger (UI/Route) -> Controller/Handler (Server Actions) -> Service/Logic -> Repository/ORM (Prisma) -> Database (PostgreSQL)`

**Constraint:** Internal data fetching NEVER uses `fetch`/`axios`. Only Server Actions.

---

## 3. Clean Tree (Module Map)

```text
cpis/
├── prisma/
│   ├── schema/                    # Modular Prisma schemas (14 files)
│   └── migrations/                # Prisma migration history
├── src/
│   ├── app/                       # Next.js App Router (Route Handlers + Pages)
│   │   ├── (main)/                # Protected route group
│   │   ├── login/                 # Public auth pages
│   │   └── api/                   # EXTERNAL WEBHOOKS ONLY
│   ├── features/                  # Vertical slices (domain logic)
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── projects/
│   │   ├── log-sheets/
│   │   ├── work-reports/
│   │   ├── attendance/
│   │   ├── dashboard/
│   │   └── users/
│   ├── components/                # Shared UI primitives (shadcn-based)
│   ├── lib/                       # Shared utilities (prisma.ts, logger.ts, rbac.ts)
│   └── __tests__/                 # E2E tests and video scenarios
├── worker/                        # Cloudflare Worker (separate subproject)
├── scripts/                       # Maintenance scripts
├── public/                        # Static assets
└── docs/                          # Project documentation
```

---

## 4. Data & State Activity

- **Client-side state:** Zustand (lightweight, feature-scoped stores). Used sparingly.
- **Server-side state:** React Server Components (RSC) + Server Actions. Most data fetched server-side.
- **Primary CRUD operations live in Services:**
  - `src/features/log-sheets/service.ts`
  - `src/features/work-reports/service.ts`
  - `src/features/attendance/service.ts`
  - `src/features/projects/service.ts`
  - `src/features/clients/service.ts`
  - `src/features/auth/service.ts`
  - `src/features/users/services/`

---

## 5. External Integrations

- **Supabase:** Auth (email/password + JWT) handled in `src/features/auth/lib/supabase.ts`
- **Cloudflare R2:** File storage handled in `src/lib/r2-upload.ts` + `worker/`
- **Stripe (planned):** Payments via webhooks in `app/api/stripe/`

---

## 6. Key Entry Points

- `src/features/auth/actions.ts` -> `loginAction`, `logoutAction`
- `src/features/log-sheets/actions.ts` -> `createLogSheetAction`, `submitLogSheetAction`
- `src/features/work-reports/actions.ts` -> `createWorkReportAction`
- `src/features/attendance/actions.ts` -> `clockInAction`, `clockOutAction`
- `src/features/projects/actions.ts` -> `createProjectAction`
- `src/lib/auth-helpers.ts` -> `requireActor()`, `getActorOrNull()`
- `src/lib/rbac.ts` -> `canAccessProject()`, `isProjectPic()`
- `src/lib/prisma.ts` -> `prisma` singleton
