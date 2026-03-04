# Session Context — CONTEXT.md

> CPIS — Corintek Project Information System

**Last Updated:** 2026-03-02

## Active Gotchas ⚠️

- **Prisma:** The `Parameter` model NO LONGER has `minValue`/`maxValue` — all limits now live in `ParameterLimit` table via `ParameterLimitProfile`. Old code referencing `parameter.minValue` will break.
- **Auth Service:** Use `toUserResponse()` and `userResponseSelect` from `src/features/users/utils.ts` for ALL user data retrieval to ensure security and type safety.
- **Auth Primitives:** Use `hashPassword()` and `comparePassword()` from `src/features/auth/service.ts` (re-exported via `lib/auth-helpers.ts`).
- **Auth:** `requireActor()` and `getActorOrNull()` from `auth-helpers.ts` — don't use bare `getServerSession()`
- **Mobile-first:** Technicians use low-budget Android phones. Test mobile viewport FIRST, desktop second.
- **PDF:** NO backend PDF generation — use browser-native print with `@media print` / Tailwind `print:` modifiers only.
- **Error Logging:** ALL catch blocks MUST prefix with `[CPIS-ERROR] <Feature>.<Action>:`

## Active Decisions 🤔

- **Evaluating:** Whether to add video attachments to Log Sheet (Scope `LS-ADJ`) — decision pending cost analysis
- **Blocker:** `ParameterLimitProfile` refactor in progress — migration pending, TS build errors expected until fixed

## Corrections & Preferences 🔧

- Use `sonner` for ALL toasts — NOT custom toast implementations
- Use Indonesian labels: "Ubah" (Edit), "Hapus" (Delete), "Tambah" (Add)
- **Interfaces:** `I*` prefix | **Types:** `T*` prefix (e.g., `IUser`, `TCreateInput`)
- **Files:** kebab-case | **Functions:** camelCase | **Components:** PascalCase
- **Server Actions:** `[verb][Noun]Action` | **Services:** `[verb][Noun]`
- NO `any` types — use `unknown` if uncertain

## Current Sprint Focus 🎯

- **Sprint:** Parameter Limit Profile Refactor
- **Focus:** `PARAM-CAT-01` — Schema renamed (Category→Profile), migration pending
- **Off-limits:** Do NOT touch Log Sheet detail page (~437 lines) — already refactored in LS-STAB
