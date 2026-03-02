# Changelog — CHANGELOG.md

> CPIS — Corintek Project Information System

**Format:** Newest first. One section per milestone.

---

## v0.2.0 — Client Portal & Notifications (2026-02-25)

**Branch:** `feat/client-portal-cp01` (merged to `development_v2`)

### CLIENT Role & Portal (CP-01)

- [x] Added `CLIENT` to `UserRole` enum in Prisma schema
- [x] Implemented read-only CLIENT role in RBAC matrix
- [x] Created `requireActor()`, `getActorOrNull()`, `AuthenticationError` in `auth-helpers.ts`
- [x] Created `TActionResponse<T>` alias and `unauthorized()` helper in `action-helpers.ts`
- [x] Added shared Prisma select objects (`prisma-selects.ts`)
- [x] **Tests:** 46 passing (auth-helpers: 19, action-helpers: 11, rbac: 16)

**CLIENT Permissions:**

- ✅ Access: Dashboard, Summary Reports, Log Sheets, Work Reports, Reports, Projects List
- ❌ No access: Lab Analyses, Attendance, Users Admin, Projects Admin, Master Data

### My Profile (MP-01)

**Branch:** `feat/users/my-profile-mp01`

- [x] `getCurrentUserProfile`, `updateCurrentUserProfile` in `users/service.ts`
- [x] Profile actions + avatar upload in `users/actions.ts`
- [x] Profile form component + `/my-profile/page.tsx`
- [x] **Tests:** 25 passing (service: 11, actions: 14)

### RBAC & Project Scoping (RBAC-02)

- [x] `ProjectAssignment` model linking users to projects
- [x] Resource-level permissions in `ROLE_MATRIX`
- [x] Project-scoped access for SUPERVISOR/TECHNICIAN/CLIENT roles
- [x] `assertCanAccessProject` helper in Service layer
- [x] URL-guessing protection for Log Sheets, Work Reports, Lab Analyses, Summary Reports
- [x] Assignment Management UI in Project edit dialog

### Notifications System (NT-02/03)

- [x] Notification persistence and Service layer
- [x] Limit Evaluation Adapter for Log Sheets
- [x] Notifications integrated into Log Sheet submission flow
- [x] UI: Header Bell/Dropdown for notifications

---

## v0.1.5 — Log Sheet Stabilization (2026-02-20)

**Branch:** `refactor/log-sheet-stabilization` (LS-STAB)

### Refactoring Stats

- [x] Log Sheet Detail page: **-65%** lines (437 → ~150)
- [x] Service layer: **-32%** duplication removed
- [x] Tests: **+161%** coverage added

### Option A Mobile Layout

- [x] Unit-based mobile entry view with `UnitOverviewList` and `UnitEntryScreen`
- [x] Consumption section with camera input for water meters
- [x] Removed legacy mobile components (`CoolingWaterQualityMobile`, `GeneralCategoryMobile`)

### Print Preview

- [x] `log-sheet-preview.tsx` component for A4 print layout
- [x] Log sheets fit single A4 page via CSS `@media print` / Tailwind `print:` modifiers

---

## v0.1.0 — MVP Foundation (2026-02-01)

### Core Domains

- [x] **Auth:** Login/session management with NextAuth
- [x] **Clients:** Full CRUD with DataTable
- [x] **Users:** Full CRUD, roles (ADMIN, MANAGER, SUPERVISOR, TECHNICIAN, CLIENT), soft delete
- [x] **Parameters:** Master data with categories + global limits
- [x] **Projects:** Full CRUD with status, personnel assignments
- [x] **Machines:** Nested in Projects form (chillers, cooling towers)
- [x] **Chemicals:** Master CRUD + Usage tracking in Log Sheets
- [x] **Attendance:** Clock in/out + Photo validation
- [x] **Lab Analysis:** Results tracking per project
- [x] **Work Reports:** Ad-hoc technician reports + digital signatures
- [x] **Summary Reports:** Monthly project sign-off

### Infrastructure

- [x] Next.js 15 + React 19 + TypeScript 5.9
- [x] Prisma 7 + PostgreSQL schema
- [x] Tailwind 4 + shadcn component system
- [x] Server Actions architecture (no REST API for internal)
- [x] Cloudflare Worker (R2) for file uploads
- [x] Sonner toast protocol for all user feedback
