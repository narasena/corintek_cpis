# CPIS — Project Agent Rules

> **RESCUE MODE:** 2 Months Behind Schedule | Speed > Perfection | Functionality > Abstraction

## Stack

- **Core:** Next.js 16 (App Router), React 19, TypeScript 5.9
- **ORM/DB:** Prisma 7 + PostgreSQL
- **Styling:** Tailwind CSS 4 + shadcn components
- **State:** Zustand (client-side only, server-first by default)
- **Key Libs:** zod v4, react-hook-form, sonner (toasts)
- **Dev:** ESLint 9 + Prettier 3, lint-staged, Husky, Turbopack
- **Worker:** Cloudflare Worker (separate subproject in `worker/`)
- **Package Manager:** npm

## Architecture: Server Actions Only

```
UI Component → Server Action (actions.ts) → Service (service.ts) → Prisma → PostgreSQL
```

- `api/` routes = **EXTERNAL WEBHOOKS ONLY** (Stripe, cron, etc.)
- NO internal `fetch`/`axios` for app data — Server Actions only

## Naming

- **Actions:** `[verb][Noun]Action` (e.g., `updateUserAction`)
- **Services:** `[verb][Noun]` (e.g., `updateUser`)
- **Interfaces:** `I*` | **Types:** `T*`
- **Files:** kebab-case | **Functions:** camelCase | **Components:** PascalCase

## Project-Specific Rules

1. **Mobile-first:** Technicians use low-budget Android phones in field conditions
2. **Toast feedback** (sonner) MANDATORY on ALL user-facing actions (create/update/delete/login). `<Toaster />` is mounted in root layout — **do NOT add it again** in child components.
3. **CRUD pages** MUST use standard components: `DataTable`, `CrudDialog`, `ActionCell`
4. **Indonesian text:** "Ubah" = Edit, "Hapus" = Delete, "Tambah" = Add
5. **PDF** = browser-native print only (CSS `@media print` / Tailwind `print:` modifiers). Nav, action buttons, and dialogs MUST use `print:hidden` — they must NOT appear in printed output.
6. **Log sheets** MUST fit on a single A4 page in print mode
7. **Auth scope:** <40 internal users + CLIENT role (read-only portal)
8. **Logging:** Use structured `logger` from `@/lib/logger` instead of manual `console` calls.
   - Standardizes prefixes: `[CPIS-ERROR]`, `[CPIS-AUTH]`, `[CPIS-SYSTEM]`, `[CPIS-WARN]`.
   - Supports structured metadata for machine-readable logs.
9. Pre-code checklist: check `src/types` + `prisma/schema.prisma` before coding
10. If stuck after 2 attempts → STOP and document blocker
11. **shadcn Blocks first:** For any page-level layout (dashboard, sidebar, login, tables, forms), use a [shadcn/ui Block](https://ui.shadcn.com/blocks) as the base. Build custom only if no block fits AND the gap is documented.

## Constraints

- ❌ **NO new npm packages** without explicit permission
- ❌ **NO new architectural patterns** (stick to Actions → Service)
- ❌ **NO custom CSS files** (Tailwind 4 + shadcn only)
- ❌ **NO `any` types** — use `unknown` if uncertain
- ❌ **NO `console.log`** in production code
- ❌ **NO refactoring working legacy code** unless `/refactor` command given

## Legacy Code Protocol

- Treat existing large files as **read-only** libraries
- ALL new logic in **new files** — never extend `utils.ts` messes
- If modifying legacy file: **MINIMAL** change only (add import + usage)
- Use **Facade/Wrapper** pattern for new functionality over old components
- Validate inputs from legacy code as "unsafe"

## Bug Tracking Protocol

- **Zero-Friction Logging:** If you (or the agent) discover a new bug during any task (feat, fix, refactor), you MUST immediately log it to `docs/bugs.md` before continuing.
- **Format:** Assign the next available `BUG-XXX` ID, classify priority (P0-P3), and provide a concise root cause.
- **No Silos:** Never fix an out-of-scope bug silently. Log it first. If it's a P0/P1 blocker for your current task, fix it and update the status to `Fixed`. Otherwise, leave it `Open`.

## File Placement

| Component Type           | Location                         | Example                      |
| :----------------------- | :------------------------------- | :--------------------------- |
| **Route-scoped UI**      | `app/(main)/[route]/components/` | Table columns, page wrappers |
| **Domain components**    | `features/[domain]/components/`  | Forms, dialogs, previews     |
| **Shared UI primitives** | `components/ui/`                 | shadcn components            |
| **Domain hooks**         | `features/[domain]/hooks/`       | Shared hooks across routes   |
| **Unit tests**           | Colocated `*.test.ts`            | Next to source file          |
| **E2E tests**            | `src/__tests__/e2e/`             | Centralized E2E              |

## Commands

```bash
npm run dev              # Dev with Turbopack
npm run build            # Build (prisma generate first)
npm run prisma:migrate   # ALWAYS use over "prisma db push"
npm run prisma:studio    # DB inspector
npm run prisma:seed      # Seed database
```

## References

- **Architecture & file structure:** See `docs/STRUCTURE.md`
- **Project trajectory & status:** See `docs/ROADMAP.md`
- **Detailed feature specs:** See `fsd_cpis/FSD_CPIS.md` (load only when implementing specific scope IDs)
- **Global agent protocols:** Loaded via `.agent/rules/` symlink — DO NOT duplicate here
