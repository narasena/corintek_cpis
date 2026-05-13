# CPIS WBS — Module Scanning Checklist

> **Purpose:** Track which modules have been scanned and their WBS entries completed.
> **Usage:** After each gemini-cli scan session, mark the module as `[x]` done.
> **If chat truncates:** Resume from the first unchecked `[ ]` module.

---

## Scanning Order (Dependencies First → Complex Last)

### Group A: Foundation (scan first — other modules depend on these)

- [x] **M-01: Database Schema** — `prisma/schema/*.prisma`
  - Files: 13 schema files, 31 migrations
  - Scope: All models, relations, enums
  - Maps to: Parts of every Epic (WP: Database)

- [x] **M-02: Auth & Middleware** — `src/features/auth/`, `src/lib/auth-helpers.ts`, `src/lib/jwt.ts`, `src/lib/rbac.ts`, `src/middleware.ts`, `src/app/login/`
  - Files: 2 feature files + 6 lib files + 2 app files
  - Scope: Login, JWT, session, RBAC, route protection
  - Maps to: EP-001

- [x] **M-03: Shared Components & Infrastructure** — `src/components/`, `src/lib/`, `src/hooks/`, `src/@types/`, `src/types/`, `src/app/layout.tsx`, `src/app/(main)/layout.tsx`, `src/app/(main)/_components/`
  - Files: 42 components + 13 lib + 2 hooks + 5 types
  - Scope: DataTable, CrudDialog, ActionCell, sidebar, mobile-nav, UI primitives, utils
  - Maps to: EP-016

### Group B: Master Data CRUD (simpler domains, scan fast)

- [x] **M-04: Users** — `src/features/users/`, `src/app/(main)/users/`, `prisma/schema/users.prisma`
  - Files: 9 feature + 3 app files
  - Scope: CRUD, roles, soft delete
  - Maps to: EP-002

- [x] **M-05: Clients** — `src/features/clients/`, `src/app/(main)/clients/`, `prisma/schema/clients.prisma`
  - Files: 4 feature + 3 app files
  - Scope: CRUD with DataTable
  - Maps to: EP-003

- [x] **M-06: Chemicals** — `src/features/chemicals/`, `src/app/(main)/chemicals/`, `prisma/schema/chemicals.prisma`
  - Files: 5 feature + 2 app files
  - Scope: Master CRUD
  - Maps to: EP-006

- [x] **M-07: Parameters & Limit Profiles** — `src/features/parameters/`, `src/features/parameter-limit-profiles/`, `src/app/(main)/parameters/`, `prisma/schema/parameters.prisma`, `prisma/schema/parameter-limit-profiles.prisma`
  - Files: 10 + 12 feature + 3 app files
  - Scope: Master data, categories, global limits, profiles
  - Maps to: EP-009

### Group C: Core Business Logic

- [x] **M-08: Projects** — `src/features/projects/`, `src/app/(main)/projects/`, `prisma/schema/projects.prisma`
  - Files: 22 feature + 4 app files
  - Scope: CRUD, status, assignments, personnel, project types
  - Maps to: EP-004

- [x] **M-09: Machines** — `src/features/machines/`, prisma/schema/machines.prisma
  - Files: 3 feature files (nested in Projects form)
  - Scope: Machine CRUD within project context
  - Maps to: EP-005

- [x] **M-10: Attendance** — `src/features/attendance/`, `src/app/(main)/attendance/`, `prisma/schema/attendance.prisma`
  - Files: 3 feature + 3 app files
  - Scope: Clock in/out, photo validation, admin view, absence
  - Maps to: EP-007

### Group D: Complex Domains (scan carefully, most time here)

- [x] **M-11: Log Sheets** ⚠️ LARGEST MODULE — `src/features/log-sheets/`, `src/app/(main)/log-sheets/`, `prisma/schema/log-sheets.prisma`
  - Files: 95 feature + 32 app files (!!!)
  - Scope: Entry cells, categories, Option A mobile, print preview, signatures, approvals, locking, validation, chemical usage, limit breaches, notifications, photos, status, drafts
  - Maps to: EP-010
  - ⚠️ **Completed via sub-scans M-11a through M-11g**

- [x] **M-12: Work Reports** — `src/features/work-reports/`, `src/app/(main)/work-reports/`, `prisma/schema/work-reports.prisma`
  - Files: 19 feature + 8 app files
  - Scope: Ad-hoc reports, signatures (R2 storage), status policy, preview, print
  - Maps to: EP-011

- [x] **M-13: Lab Analyses** — `src/features/lab-analyses/`, `src/app/(main)/lab-analyses/`, `prisma/schema/lab-analyses.prisma`
  - Files: 5 feature + 8 app files
  - Scope: Results tracking, forms, print
  - Maps to: EP-008

- [x] **M-14: Summary Reports** — `src/features/summary-reports/`, `src/app/(main)/summary-reports/`, `prisma/schema/summary-reports.prisma`
  - Files: 3 feature + 3 app files
  - Scope: Monthly sign-off, attachments, print
  - Maps to: EP-012

### Group E: Supporting Features

- [x] **M-15: Notifications** — `src/features/notifications/`, `prisma/schema/notifications.prisma`
  - Files: 9 feature files
  - Scope: Bell, items, repository, real-time hooks
  - Maps to: EP-013

- [x] **M-16: Dashboard** — `src/features/dashboard/`, `src/app/(main)/page.tsx`, `src/app/(main)/_components/`, `src/app/(main)/components/`
  - Files: 4 feature + 6 app files
  - Scope: Analytics charts, metrics, recent photos, scoped view
  - Maps to: EP-014

- [x] **M-17: My Profile & Client Portal** — `src/app/(main)/my-profile/`, `src/app/(main)/my-projects/`, `src/app/(main)/forbidden/`
  - Files: 3 page files
  - Scope: Avatar upload, read-only CLIENT role portal, forbidden page
  - Maps to: EP-015

- [x] **M-18: Cloudflare Worker** — `worker/`
  - Files: 1 src file + config
  - Scope: R2 upload API
  - Maps to: EP-017

### Group F: Cross-Cutting (after all modules scanned)

- [x] **M-19: Seeding & DevOps** — `prisma/seed.ts`, `prisma/seed-data.ts`, `prisma/seed-export.ts`, `prisma/SEED_README.md`, config files
  - Scope: Seed scripts, Husky, lint-staged, ESLint, Prettier, commitlint
  - Maps to: EP-016 (Infrastructure)

- [x] **M-20: Testing** — src/**tests**/, all _.test.ts / _.test.tsx / _.characterization.test._
  - Files: 17 centralized test files + colocated tests
  - Scope: Unit tests, characterization tests, E2E setup
  - Maps to: Testing WPs across all Epics

---

## Progress Summary

| Group              | Modules      | Status          |
| :----------------- | :----------- | :-------------- |
| A: Foundation      | M-01 to M-03 | ✅ Completed    |
| B: Master Data     | M-04 to M-07 | 🔍 1/20 scanned |
| C: Core Business   | M-08 to M-10 | 🔍 1/20 scanned |
| D: Complex Domains | M-11 to M-14 | 🔍 1/20 scanned |
| E: Supporting      | M-15 to M-18 | 🔍 1/20 scanned |
| F: Cross-Cutting   | M-19 to M-20 | 🔍 1/20 scanned |
