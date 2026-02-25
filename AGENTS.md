# CPIS - Project Guidelines

> **RESCUE MODE:** 2 Months Behind Schedule | Speed > Perfection | Functionality > Abstraction

## 🎯 Project-Specific Rules

### 1. Architecture: Server Actions Only

We eliminated the REST API layer. **The flow is:**

1. **UI Component** → Calls Server Action directly (no `fetch`/`axios` for internal data)
2. **Action** (`src/features/.../actions.ts`) → Validates input → Calls Service → Revalidates path
3. **Service** (`src/features/.../service.ts`) → Pure business logic & Prisma calls
4. **DB** → Prisma Client

### 2. Constraints

- ❌ **NO new npm packages** without explicit permission (request with valid reason)
- ❌ **NO new architectural patterns** (stick to Actions → Service pattern)
- ❌ **NO custom CSS** files (Tailwind 4 + shadcn only)

### 3. Pre-Coding Checklist

- ✅ Check `src/types` and `prisma/schema.prisma` before coding
- ✅ Verify imports against `tsconfig.json` aliases (`@/lib`, `@/features`)
- ✅ If stuck after 2 attempts → STOP and document blocker

### 4. Testing (Emergency Mode)

- **Logic-only tests** for `service.ts` with complex business rules
- NO TDD, NO component tests
- Generate tests _after_ implementation; stop after 3 failures

---

# Repository Guidelines

## Project Roadmap

Roadmap for this project can be found in [ROADMAP](.gemini/ROADMAP.md)

While the project's FSD is in [FSD](fsd_cpis/FSD_CPIS.md)

## Project Structure & Module Organization

- **prisma/** — Root level Prisma schema (Single Source of Truth).
- **src/**
  - **app/** — Next.js App Router.
    - `\(main\)/` — Application pages.
    - `api/` — **EXTERNAL WEBHOOKS ONLY**. Do not use for internal features.
  - **components/** — Reusable UI (Shadcn).
  - **features/** — **Vertical Slices (The Core)**.
    - `auth/`, `projects/`, `users/`...
    - `components/` — Feature-specific UI.
      - `actions.ts` — Server Actions ('use server').
      - `service.ts` — Pure Business Logic.
- **lib/** — Shared utilities (`prisma.ts` singleton).
- **types/** — Shared TypeScript types.

## Build, Test, and Development Commands

```bash
# Run the Next.js app in dev with Turbopack
npm run dev

# Build (generates Prisma client first) and start
npm run build
npm start

# Lint and format staged files
npm run lint

# Prisma (development DB)
# ALWAYS apply "npm run prisma:migrate" over any "prisma db push" to maintain migration history.
npm run prisma:migrate     # migrate dev
npm run prisma:status      # migration status
npm run prisma:studio      # open Prisma Studio
npm run prisma:generate    # generate client
npm run prisma:validate    # validate schema
npm run prisma:format      # format schema
npm run prisma:push        # push schema
npm run prisma:seed        # seed DB
```

## Coding Style & Naming

- **Server Actions:** `[verb][Noun]Action` (e.g., `updateUserAction`)
- **Services:** `[verb][Noun]` (e.g., `updateUser`)
- **Interfaces:** Prefix with `I` (e.g., `IUser`, `IProject`)
- **Types:** Prefix with `T` (e.g., `TUserRole`, `TCreateInput`)
- Files: kebab-case | Functions: camelCase | Components: PascalCase

## Testing

- Framework: Not specified in main app. Worker subproject uses Vitest (see worker/vitest.config.mts)
- Test files: Not present in main app; worker/ has test directory
- Running tests: In worker: cd worker && npm test (if configured) or npm run test per worker/package.json
- Coverage: Not specified

## Commit Guidelines

- Format: Conventional Commits (see `commitlint.config.js` for types: feat, fix, docs, build, style, refactor, test, chore, perf, ci, revert)
- **Scope Separation:** Separate commits for different scopes (don't bundle unrelated changes)
- **DO NOT COMMIT DIRECTLY ON `main`/`master`, `dev`/`development`, `stage`/`staging`, all commits must be created their own dedicated branches first.**
- Create a dedicated branch first before excution / implementation (when you need to write access )

---

# Repository Tour

## 🎯 What This Repository Does

CORINTEK Project Information System (CPIS) is a Next.js-based web application. GOAL: Deliver MVP functionality for <40 internal users immediately.

Key responsibilities:

- Manage clients, projects, users/personnel, chemicals, parameters, and log sheets
- Expose REST-like API endpoints under /api/v1 via Next.js App Router
- Persist data using Prisma ORM with PostgreSQL; manage schema/migrations

---

## 🏗️ Architecture Overview

The system uses Next.js Server Actions to eliminate the API layer overhead.

### System Context

```
Browser/Client (React)
      ↓
Server Action (RPC)
      ↓
Service Layer (Logic)
      ↓
Prisma Client → PostgreSQL
```

### Key Components

- Feature Layer (src/features/\*): Self-contained domains.
- Service Layer (service.ts): Framework-agnostic logic.
- Prisma Singleton (src/lib/prisma.ts): Prevents connection exhaustion.

### Data Flow (The New Way)

1. User submits form in UI.
2. useTransition or <form action={...}> calls src/features/xyz/actions.ts.
3. Action validates FormData or arguments.
4. Action calls src/features/xyz/service.ts.
5. Service executes Prisma query.
6. Action calls revalidatePath(...) to refresh UI automatically.

---

## 📁 Project Structure [Partial Directory Tree]

```
.

├── prisma/                 <-- KEEPS IT SIMPLE. Root level.
│   └── schema.prisma       <-- Your single source of truth.
├── public/
├── src/
│   ├── app/                <-- Routes & Pages only.
│   │   ├── \(auth\)/         <-- Route Group for auth pages
│   │   ├── api/            <-- Route Handlers (webhooks, external APIs)
│   │   ├── dashboard/      <-- Protected routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/         <-- Shared UI (Buttons, Inputs, etc.)
│   ├── lib/
│   │   ├── prisma.ts       <-- THE DB CONNECTION (Singleton pattern)
│   │   └── utils.ts
│   ├── features/           <-- DOMAIN LOGIC (The "Meat")
│   │   ├── auth/           <-- Co-locate everything related to a feature
│   │   │   ├── actions.ts  <-- Server Actions (Backend Logic)
│   │   │   ├── components/ <-- Auth-specific forms
│   │   │   └── types.ts
│   │   └── billing/
│   └── types/              <-- Global types (if necessary)
├─ public/                       # Static assets
├─ worker/                       # Cloudflare Worker project
├─ commitlint.config.js          # Conventional Commit rules
├─ eslint.config.mjs             # ESLint + Prettier configuration
├─ next.config.ts                # Next.js config
├─ package.json                  # Scripts and dependencies
└─ tsconfig.json                 # TS config with path alias @/*
```

### Key Files to Know

File Purpose
prisma/schema.prisma The Database Truth. Start here for every feature.
src/lib/prisma.ts The DB Connection Singleton.
src/features/[name]/actions.ts The Backend Entry Point (Server Actions).
src/features/[name]/service.ts The Business Logic (Pure Typescript).
src/app/layout.tsx Global providers & styles.

---

## 🔧 Technology Stack

Core Technologies

- Language: TypeScript (5.9.x)
- Framework: Next.js 15 (App Router, edge-ready) with React 19
- ORM/DB: Prisma 7 with PostgreSQL (DATABASE_URL, DIRECT_URL)
- UI: shadcn-like UI patterns for components
- Styling: Tailwind CSS 4
- State: Zustand

Key Libraries

- zod v4 + @hookform/resolvers + react-hook-form for forms/validation
- axios for HTTP client
- jsonwebtoken/bcrypt for auth utilities

Development Tools

- ESLint 9 + Prettier 3 with lint-staged and Husky
- dotenv-cli for Prisma scripts, Prisma Studio for DB inspection
- Wrangler for Cloudflare Worker; Vitest in worker subproject

---

## 🌐 External Dependencies

- PostgreSQL — Primary database for Prisma models
- Cloudflare R2 — Used by worker for asset storage (see README commands and wrangler.jsonc)
- Vercel — Deployment target for Next.js app (mentioned in README)

### Environment Variables

From schema.prisma and common Next.js patterns:

- DATABASE_URL — PostgreSQL connection string
- DIRECT_URL — Direct connection for migrations
- Other envs may exist in .env.development / .env.production (not listed here for secrets)

## 📈 Performance & Scale

- Prisma logging enabled for info/warn/error in prisma client
- Next.js with Turbopack for faster dev builds

## 🚨 Things to Be Careful About

Security Considerations

- Do not commit .env.\* files with secrets; .env.development and .env.production exist

## 🚨 Feedback & Notifications

### 1. The "Toast" Protocol (Sonner)

- **MANDATORY:** All user-facing actions (Create, Update, Delete, Login, etc.) MUST provide immediate feedback via `sonner` toasts.
- **Success:** Use `toast.success("Done!", { description: "Brief details..." })`.
- **Error:** Use `toast.error("Failed!", { description: "Error message..." })`.
- **Consistency:** Use clear, concise language in toasts.
- **Placement:** `<Toaster />` is defined in the root layout. No need to re-add.

### 2. The "CRUD Management Table" Standard

- **MANDATORY:** All domain CRUD management pages (users, clients, projects, etc.) MUST use the standard reusable components from `src/components/`.
- **Components:**
  - `DataTable` - Generic data table with Tanstack Table & pagination
  - `CrudDialog` - Generic dialog wrapper for create/edit forms
  - `ActionCell` - Generic action cell with edit/delete dropdown
- **Localization:** Use Indonesian text consistently:
  - "Ubah" for Edit
  - "Hapus" for Delete
  - "Tambah" for Create/Add
- **DO NOT:** Create custom table implementations unless explicitly requested by the user.
- **DO NOT:** Add features like drag-drop, row selection, tabs, or column visibility unless explicitly requested.
- **Pattern:** Follow the standard layout:
  - Page header with title and "Tambah [Entity]" button
  - DataTable with domain-specific columns
  - Action cell with "Ubah" and "Hapus" options
  - CrudDialog for create/edit operations

---

# 🚨 SPECIAL IMPLEMENTATION RULES

## A. PDF & Printing Engine

**_DO NOT IMPLEMENT A PDF GENERATION BACKEND._**

- Strategy: "Browser-Native Print".

- Implementation:
  - Create a standard React page (e.g., /projects/[id]/invoice/print).

  - Use CSS @media print or Tailwind print: modifiers.

  - Hide navigation, sidebars, and buttons in print view.

  - User workflow: Click "Print" button -> Browser Print Dialog -> Save as PDF.

  - **Constraint:** Log sheets MUST fit on a single A4 page in print mode.

## B. Internal vs. External API

- Internal App: Uses Server Actions ONLY. No src/app/api routes.

- External Integrations: If a 3rd party (Stripe/Cron) needs to call us, use src/app/api/webhooks/....

## C. Authentication

- Scope: Internal Team (<40 Users).

- Authorization: Role checks happen in the Service Layer (service.ts).

---

## 📁 Folder Organization Rules

### Component Placement

| Component Type           | Location                         | Example                               |
| ------------------------ | -------------------------------- | ------------------------------------- |
| **Route-scoped UI**      | `app/(main)/[route]/components/` | Table columns, page-specific wrappers |
| **Domain components**    | `features/[domain]/components/`  | Forms, dialogs, previews              |
| **Shared UI primitives** | `components/ui/`                 | shadcn components, buttons, inputs    |

**Rules:**

- Forms (create/edit) → `features/[domain]/components/[entity]-form.tsx`
- Dialogs → `features/[domain]/components/[entity]-dialog.tsx`
- Table columns → `app/(main)/[route]/components/columns.tsx` (route-specific)
- Hooks used across routes → `features/[domain]/hooks/`

### Test Placement

| Test Type                | Location                               | Example                                          |
| ------------------------ | -------------------------------------- | ------------------------------------------------ |
| **Unit/Component tests** | Colocated (`*.test.ts` next to source) | `service.ts` + `service.test.ts`                 |
| **E2E tests**            | `src/__tests__/e2e/`                   | `src/__tests__/e2e/log-sheet/happy-path.spec.ts` |

**Rules:**

- ❌ NO `__tests__` folders for unit/component tests
- ✅ Tests live alongside their source files
- ✅ E2E tests remain centralized in `src/__tests__/e2e/`

### Directory Structure (After Refactor)

```
src/
├── app/(main)/                    # Routes only
│   ├── log-sheets/
│   │   ├── page.tsx               # Project list
│   │   ├── [projectId]/
│   │   │   ├── page.tsx           # Log sheet list
│   │   │   ├── columns.tsx        # Route-scoped columns
│   │   │   └── columns.test.tsx   # Colocated test
│   │   └── [projectId]/[logSheetId]/
│   │       ├── page.tsx           # Detail page
│   │       ├── entry-cells.tsx    # Page-specific component
│   │       ├── hooks/             # Page-specific hooks
│   │       └── utils.ts
│   └── ...
│
├── features/
│   └── log-sheets/
│       ├── actions.ts
│       ├── actions.test.ts        # Colocated test
│       ├── service.ts
│       ├── service.test.ts        # Colocated test
│       ├── types.ts
│       ├── validation.ts
│       ├── components/            # Domain components
│       │   ├── log-sheet-form.tsx
│       │   ├── log-sheet-dialog.tsx
│       │   ├── log-sheet-toolbar.tsx
│       │   └── log-sheet-preview/
│       └── hooks/                 # Reusable hooks
│           └── use-log-sheet-technicians.ts
│
└── __tests__/e2e/                 # E2E tests only
    └── log-sheet/
```

Update to last commit: 3c0934cc20e56f2ad23096d3b1815a525f9a528f
