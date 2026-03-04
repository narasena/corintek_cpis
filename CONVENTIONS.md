# CPIS Coding Conventions

> For AI coding agents (Aider, Cursor, etc.) during refactoring and development.

## Stack

- Next.js 16 (App Router), React 19, TypeScript 5.9
- Prisma 7 + PostgreSQL
- Tailwind CSS 4 + shadcn/ui
- Zustand (client-side only), zod v4, react-hook-form, sonner

## Architecture

```
UI Component → Server Action (actions.ts) → Service (service.ts) → Prisma → DB
```

- NO `api/` routes for internal data — Server Actions only
- `api/` routes = external webhooks only (Stripe, cron)

## Naming

| Thing      | Convention           | Example              |
| ---------- | -------------------- | -------------------- |
| Actions    | `[verb][Noun]Action` | `updateUserAction`   |
| Services   | `[verb][Noun]`       | `updateUser`         |
| Interfaces | `I` prefix           | `ILogSheet`          |
| Types      | `T` prefix           | `TStatus`            |
| Files      | kebab-case           | `log-sheet-form.tsx` |
| Functions  | camelCase            | `calculateTotal`     |
| Components | PascalCase           | `LogSheetForm`       |

## File Placement

| Type              | Location                             |
| ----------------- | ------------------------------------ |
| Route-scoped UI   | `app/(main)/[route]/components/`     |
| Domain components | `features/[domain]/components/`      |
| Domain hooks      | `features/[domain]/hooks/`           |
| Shared UI         | `components/ui/` (shadcn)            |
| Unit/char tests   | Colocated `*.test.ts` next to source |
| E2E tests         | `src/__tests__/e2e/`                 |

## Refactoring Rules (Phase 5)

1. **ONE smell at a time.** Identify one → plan one → fix one → run tests → commit.
2. **Low risk → high risk.** Never start with core logic.
3. **Scope to ONE file.** Don't refactor multiple files in a single change.
4. **All existing tests must pass** after every change.
5. **No behavior changes.** Refactoring must not alter observable behavior.
6. **Update SSOT Docs.** If changes alter file structure or public exports, update the related `docs/refactoring/modules/` markdown files. Stale docs are not allowed.
7. **Cross-Module Impact.** Do NOT modify files outside the current module boundary unless absolutely necessary for shared types/actions. Flag any external impact to user.
8. **Preserve Characterization.** Surprising behaviors documented in `CHARACTERIZATION_FINDINGS.md` MUST be preserved. Do not "fix" bugs during refactoring.
9. **Atomic Commits.** One smell/refactoring = one commit. Commit immediately after successful test run.

## Hard Constraints

- ❌ NO new npm packages without permission
- ❌ NO new architectural patterns (stick to Actions → Service)
- ❌ NO custom CSS files (Tailwind 4 + shadcn only)
- ❌ NO `any` types — use `unknown`
- ❌ NO `console.log` in production code
- ❌ NO methods > 30 lines without justification
- ❌ NO magic strings — centralize in `constants.ts`

## Project Context

- **Mobile-first:** Technicians use low-budget Android phones in field
- **Toast feedback** (sonner) mandatory on all CRUD actions
- **Indonesian UI text:** Ubah=Edit, Hapus=Delete, Tambah=Add
- **Error prefix:** `[CPIS-ERROR] <Feature>.<Action>:` in all catch blocks
- **Pre-code:** Check `src/types` + `prisma/schema.prisma` before coding
- **Validate Input:** Treat all data from legacy code as "unsafe" in Server Actions
