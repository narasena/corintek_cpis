# Project "Rescue Mission" - AI Engineering Guidelines

> **SYSTEM ALERT: PROJECT IS IN CRITICAL RECOVERY MODE.**
> Current Status: 2 Months Behind Schedule.
> Priority: Speed > Perfection. Functionality > Abstraction.

## 🤖 Agent Behavioral Directives (THE LAW)

### 1. The "No New Toys" Rule

- **FORBIDDEN:** You may NOT install new npm packages without explicit permission. **EXCEPTION:** You may request to install a package if you provide a valid reason (e.g., improved code, better tooling, cool aesthetics, or required UI components). Explain WHY before asking.
- **FORBIDDEN:** Do not introduce new architectural patterns (e.g., don't add a "Repository Pattern" layer; use Services).
- **FORBIDDEN:** Do not change the styling system. We use Tailwind 4 + shadCn. Do not write custom CSS in `.css` files.

### 2. The "Strict Architecture" Flow (Server Actions)

We are moving away from REST APIs for internal features.

1.  **UI Component:** Calls Server Action directly (no `fetch`, no `axios` for internal data).
2.  **Action Wrapper:** `src/features/.../actions.ts` (Validates Input -> Calls Service -> Revalidates Path).
3.  **Service Layer:** `src/features/.../service.ts` (Pure Business Logic & Prisma calls).
4.  **DB:** Prisma Client.

### 3. The "Anti-Hallucination" Protocol

- **Before Coding:** You must check `src/types` and `prisma/schema.prisma`.
- **Imports:** Do not assume imports. Check aliases in `tsconfig.json` (Use `@/lib`, `@/features`, etc.).
- **If Stuck:** If you cannot solve a bug in 2 attempts, STOP and generate a "Plan B" artifact explaining the blocker.

## 4. Testing Protocol

## 4. Testing Protocol (Emergency Mode)

- **NO TDD:** Do not write tests before code.
- **NO UI Testing:** Do not test components or pages.
- **Logic Only:** Only write Unit Tests for `service.ts` files containing complex math or business rules.
- **AI-Generated:** Use AI to generate these tests _after_ implementation to verify logic.
- If a test fails 3 times, **STOP** and ask the human for help.

---

# Repository Guidelines

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
npm run prisma:migrate     # migrate dev
npm run prisma:status      # migration status
npm run prisma:studio      # open Prisma Studio
npm run prisma:generate    # generate client
npm run prisma:validate    # validate schema
npm run prisma:format      # format schema
npm run prisma:push        # push schema
npm run prisma:seed        # seed DB
```

## Coding Style & Naming Conventions

- Indentation: 2 spaces
- Server Actions: Named [verb][Noun]Action (e.g., updateUserAction).
- Services: Named [verb][Noun] (e.g., updateUser).
- Files: kebab-case (user-profile.tsx, actions.ts).
- Function/variable naming: camelCase; PascalCase for React components
- Naming Convention (TS):
  - Interfaces must start with "I" (e.g., IUser, IProject).
  - Types must start with "T" (e.g., TUserRole, TCreateInput).
- Formatting: Prettier enforced.
- Linting/Formatting: ESLint (eslint.config.mjs) with Prettier enforced via eslint-plugin-prettier; lint-staged runs "eslint --fix" and "prettier --write" on JS/TS/TSX files

## Testing Guidelines

- Framework: Not specified in main app. Worker subproject uses Vitest (see worker/vitest.config.mts)
- Test files: Not present in main app; worker/ has test directory
- Running tests: In worker: cd worker && npm test (if configured) or npm run test per worker/package.json
- Coverage: Not specified

## Commit & Pull Request Guidelines

- Commit format: Conventional Commits via commitlint.config.js always check this file before commit.
  - Types allowed: feat, fix, docs, build, style, refactor, test, chore, perf, ci, revert
  - Examples:
    - feat(log-sheet): create log sheet ver 1
    - fix(project): npm run build
- PR process: Not documented. Recommend linking issues and passing CI, lint.
- Branch naming: Not specified. A branch named feat exists in refs; follow feature branch naming (e.g., feat/<topic>)

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

## B. Internal vs. External API

- Internal App: Uses Server Actions ONLY. No src/app/api routes.

- External Integrations: If a 3rd party (Stripe/Cron) needs to call us, use src/app/api/webhooks/....

## C. Authentication

- Scope: Internal Team (<40 Users).

- Authorization: Role checks happen in the Service Layer (service.ts).

Update to last commit: 3c0934cc20e56f2ad23096d3b1815a525f9a528f
