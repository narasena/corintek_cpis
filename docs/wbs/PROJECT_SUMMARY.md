# CPIS — Project Deliverable Summary

> **Project:** Corintek Project Information System (CPIS)
> **Developer:** [Your Name]
> **Date:** 2026-03-03
> **Contract Start:** September 2025
> **Delivery Period:** September 2025 – March 2026 (~6 months)

---

## 1. Executive Summary

CPIS is a full-stack web application built for Corintek to manage water treatment field operations. The system replaces manual paper-based workflows with a digital platform covering project management, daily log sheets, lab analysis, work reports, attendance, and client-facing summary reports.

### Technology Stack

| Layer          | Technology                                           |
| :------------- | :--------------------------------------------------- |
| Framework      | Next.js 16 (App Router), React 19, TypeScript 5.9    |
| Database       | PostgreSQL + Prisma 7 ORM                            |
| Styling        | Tailwind CSS 4 + shadcn/ui component library         |
| Authentication | JWT (jose) + bcrypt + HTTP-only cookies              |
| File Storage   | Cloudflare R2 (via dedicated Worker)                 |
| Dev Tooling    | ESLint 9, Prettier 3, Husky, lint-staged, Commitlint |
| Testing        | Vitest (unit + characterization tests)               |

### Architecture

Server Actions–only architecture — no REST API layer for internal data flow:

```
UI Component → Server Action → Service Layer → Prisma → PostgreSQL
```

API routes reserved exclusively for external webhooks (Stripe, cron jobs).

---

## 2. Deliverables Inventory

### Core Modules Delivered

| #   | Module                          | Capabilities                                                                                                                                                                                                                                             | Complexity    |
| :-- | :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ |
| 1   | **Authentication & RBAC**       | Login/logout, JWT sessions, 8-role permission matrix across 11 resources                                                                                                                                                                                 | High          |
| 2   | **User Management**             | Full CRUD, role assignment, soft delete, avatar upload (R2), profile edit                                                                                                                                                                                | Medium        |
| 3   | **Client Management**           | Full CRUD with DataTable, soft delete, duplicate detection                                                                                                                                                                                               | Low           |
| 4   | **Project Management**          | Full CRUD, project types/statuses/contracts, personnel assignments, machine sync, addendum support, parameter overrides                                                                                                                                  | High          |
| 5   | **Machine Management**          | CRUD nested within Projects, type/ownership/status enums                                                                                                                                                                                                 | Low           |
| 6   | **Chemical Management**         | Master CRUD + Log Sheet integration                                                                                                                                                                                                                      | Low           |
| 7   | **Attendance & Absence**        | Clock in/out with photo capture, admin view, date-based tracking                                                                                                                                                                                         | Medium        |
| 8   | **Lab Analysis**                | Multi-column analysis forms, parameter entries, print layout                                                                                                                                                                                             | Medium        |
| 9   | **Parameters & Limit Profiles** | Master data with categories, value types, reusable limit profiles, project overrides                                                                                                                                                                     | Medium        |
| 10  | **Log Sheets**                  | Daily entry forms, multi-machine support, category sections, mobile-first Option A view, print preview (A4), signatures, approval workflow, locking, limit breach detection & notifications, draft auto-save, chemical usage tracking, photo attachments | **Very High** |
| 11  | **Work Reports**                | Ad-hoc reports, signature capture (R2 storage), approval workflow, preview, photos                                                                                                                                                                       | Medium        |
| 12  | **Summary Reports**             | Monthly project sign-off, PDF attachment uploads (R2), section toggles, print layout                                                                                                                                                                     | Medium        |
| 13  | **Notifications**               | In-app bell, notification items, read/unread, severity levels, limit breach alerts                                                                                                                                                                       | Medium        |
| 14  | **Dashboard**                   | Analytics charts (Ampere, Approach), metrics, recent photos gallery, project-scoped view                                                                                                                                                                 | Medium        |
| 15  | **Client Portal & My Profile**  | Read-only CLIENT role portal, avatar upload, profile editing                                                                                                                                                                                             | Low           |

### Infrastructure Delivered

| Component             | Details                                                                                  |
| :-------------------- | :--------------------------------------------------------------------------------------- |
| **Database**          | 21 models, 17 enums, 31 migrations, seed scripts                                         |
| **Shared Components** | 42 reusable UI components (DataTable, CrudDialog, ActionCell, sidebar, mobile nav, etc.) |
| **Cloudflare Worker** | Dedicated R2 upload API (separate subproject)                                            |
| **Middleware**        | Route protection + RBAC enforcement + authenticated redirects                            |
| **Testing**           | 17+ test files (unit + characterization tests)                                           |
| **DevOps**            | Git hooks (Husky), lint-staged, commitlint, ESLint + Prettier                            |

### Key Statistics

| Metric                              | Value   |
| :---------------------------------- | :------ |
| Total source lines (TypeScript/TSX) | ~59,800 |
| Feature domains                     | 15      |
| Page routes                         | 29      |
| Server Actions files                | 15      |
| Service layer files                 | 15      |
| Shared UI components                | 42      |
| Prisma models                       | 21      |
| Database migrations                 | 31      |

---

## 3. Project Valuation

| Metric                                |             Value |
| :------------------------------------ | ----------------: |
| Total Estimated Hours (PERT Expected) |        **802.60** |
| Hourly Rate (Mid-Level Developer)     |         Rp 85,000 |
| **Actual Project Value**              | **Rp 68,221,000** |
| Contract Price                        |      Rp 5,000,000 |
| Difference                            |   - Rp 63,221,000 |
| Contract as % of Actual Value         |          **7.3%** |

> **Note:** Hours estimated using PERT method (Optimistic + 4×Likely + Pessimistic ÷ 6) at mid-level developer rates.
> Detailed task-level breakdown available in `WBS_DETAILED.md`.

---

## 4. What This Project Enables

For the client, CPIS replaces:

- ✅ Paper-based daily log sheets → Digital log sheets with limit breach detection
- ✅ Manual attendance tracking → Photo-verified clock in/out
- ✅ Email-based work reports → Digital reports with signatures
- ✅ Spreadsheet lab analysis → Structured data entry with print layouts
- ✅ Manual monthly summaries → Auto-aggregated summary reports
- ✅ No client visibility → Read-only client portal

---

> **Detailed WBS:** See `WBS_DETAILED.md`
> **Maintenance Options:** See `MAINTENANCE_PROPOSAL.md`
