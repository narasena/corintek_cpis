# Project Architecture — STRUCTURE.md

> CPIS — Corintek Project Information System

**Last Verified:** 2026-03-02

## System Overview

CPIS is a Next.js-based Project Information System for facility management. It tracks HVAC chiller/cooling tower operations via Log Sheets, manages projects/clients/users, and provides role-based access for internal staff (<40 users) plus CLIENT portal users.

## Directory Map

```
cpis/
├── prisma/                    # Database schema (single source of truth)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Route group: login pages
│   │   ├── (main)/            # Route group: protected app pages
│   │   │   ├── dashboard/
│   │   │   ├── clients/
│   │   │   ├── projects/
│   │   │   ├── log-sheets/
│   │   │   ├── users/
│   │   │   └── ...            # Other domains
│   │   └── api/               # EXTERNAL WEBHOOKS ONLY (Stripe, cron, etc.)
│   ├── components/            # Shared UI (shadcn-based)
│   │   ├── ui/                # shadcn primitives
│   │   ├── data-table.tsx     # Generic DataTable (Tanstack Table)
│   │   ├── crud-dialog.tsx    # Generic create/edit dialog
│   │   └── action-cell.tsx    # Generic edit/delete dropdown
│   ├── features/              # Domain logic (vertical slices)
│   │   ├── auth/              # actions.ts, service.ts, components/, types.ts
│   │   ├── clients/
│   │   ├── projects/
│   │   ├── log-sheets/
│   │   ├── users/
│   │   ├── parameters/
│   │   ├── attendance/
│   │   ├── work-reports/
│   │   ├── summary-reports/
│   │   ├── notifications/
│   │   └── parameter-limit-profiles/  # New: limit profile management
│   ├── lib/                   # Shared utilities
│   │   ├── prisma.ts          # Prisma singleton (prevents connection exhaustion)
│   │   ├── auth-helpers.ts    # requireActor(), getActorOrNull(), AuthenticationError
│   │   └── action-helpers.ts  # TActionResponse, unauthorized()
│   └── types/                 # Shared TypeScript types
├── worker/                    # Cloudflare Worker (R2 uploads)
└── public/                    # Static assets
```

## Key Data Flows

### Server Actions Flow (Internal)

```
1. UI Component → calls Server Action (actions.ts)
2. Action → validates input (Zod schema)
3. Action → calls Service (service.ts)
4. Service → executes Prisma query + business logic
5. Service → returns result
6. Action → calls revalidatePath() to refresh UI
7. Action → returns { success: true } or { success: false, message: "..." }
8. UI → shows toast via sonner (success/error feedback mandatory)
```

### File Upload Flow (External)

```
1. Client → requests presigned URL via Server Action
2. Server → generates R2 presigned URL
3. Client → uploads directly to Cloudflare R2
4. Client → confirms upload → Server saves file metadata
```

## Key Abstractions

| Abstraction            | Purpose                                                  | Location                                 |
| ---------------------- | -------------------------------------------------------- | ---------------------------------------- |
| `requireActor()`       | Auth guard — throws if no session                        | `src/lib/auth-helpers.ts`                |
| `getActorOrNull()`     | Auth check — returns null if no session                  | `src/lib/auth-helpers.ts`                |
| `TActionResponse<T>`   | Standard action return type `{success, message?, data?}` | `src/lib/action-helpers.ts`              |
| `DataTable`            | Generic table with pagination/sorting                    | `src/components/data-table.tsx`          |
| `DataTableEmpty`       | Premium empty state with action CTA                      | `src/components/ui/data-table-empty.tsx` |
| `CrudDialog`           | Generic dialog for create/edit forms                     | `src/components/crud-dialog.tsx`         |
| `Combobox`             | Searchable dropdown component                            | `src/components/ui/combobox.tsx`         |
| `DatePicker`           | Standard date selection component                        | `src/components/ui/date-picker.tsx`      |
| `Switch`               | Premium toggle switch (primitive)                        | `src/components/ui/switch.tsx`           |
| `ActionCell`           | Dropdown menu with Ubah/Hapus                            | `src/components/action-cell.tsx`         |
| `useNotificationStore` | Zustand store for notification bell                      | `src/features/notifications/hooks.ts`    |

## Integration Points

| System        | Protocol      | Purpose               | Config                                 |
| ------------- | ------------- | --------------------- | -------------------------------------- |
| PostgreSQL    | Prisma ORM    | Primary database      | `prisma/schema.prisma`, `DATABASE_URL` |
| Cloudflare R2 | S3-compatible | File storage (photos) | `worker/wrangler.jsonc`                |
| NextAuth      | JWT sessions  | Authentication        | `src/features/auth/config.ts`          |

## Database Schema (Simplified)

```
User ──────┐
  │        ├── Attendance (clock in/out + photo)
  │        ├── WorkReport (ad-hoc reports + signatures)
  │        └── Notification (NT-02/03)
  │
  └── ProjectAssignment ────┐
                            │
Client ───┐                 │
  │       │                 │
  └── Project ──┬───────────┘
    │           ├── Machine (chillers, cooling towers)
    │           ├── ProjectParameterOverride (legacy, migrating to Profile)
    │           ├── LogSheet ─────┬── LogSheetEntry (per-unit data)
    │           │                 ├── LogSheetConsumption (water meters)
    │           │                 ├── LogSheetPhoto (before/after)
    │           │                 └── LogSheetChemicalFill (chemical usage)
    │           │
    │           ├── LabAnalysis ──┬── LabAnalysisResult (parameter values)
    │           │
    │           └── SummaryReport (monthly sign-off)
    │
    └── ParameterLimitProfile ────┬── ParameterLimit (per-parameter limits)
                                  └── rawWaterMin/rawWaterMax support
```

## Environment & Config

| Config         | Source                                | Notes                      |
| -------------- | ------------------------------------- | -------------------------- |
| App config     | `next.config.ts`                      | Turbopack, redirects       |
| DB connection  | `.env` → `DATABASE_URL`, `DIRECT_URL` | Never commit `.env` files  |
| Auth secrets   | `.env` → `NEXTAUTH_SECRET`            | Rotate quarterly           |
| R2 credentials | `worker/wrangler.jsonc`               | Cloudflare Worker env vars |
