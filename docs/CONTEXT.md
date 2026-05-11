# Session Context — CONTEXT.md

> CPIS — Corintek Plant Information System

**Last Updated:** 2026-03-14

## Active Gotchas ⚠️

- **Secrets:** Never hardcode credentials in seed scripts or source. Use env vars (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_CREATE_ADMIN`). Dev branch still has hardcoded admin — fix immediately.
- **Prisma:** The `Parameter` model NO LONGER has `minValue`/`maxValue` — all limits now live in `ParameterLimit` table via `ParameterLimitProfile`. Old code referencing `parameter.minValue` will break.
- **Auth Service:** Use `toUserResponse()` and `userResponseSelect` from `src/features/users/utils.ts` for ALL user data retrieval to ensure security and type safety.
- **Auth Primitives:** Use `hashPassword()` and `comparePassword()` from `src/features/auth/service.ts` (re-exported via `lib/auth-helpers.ts`).
- **Auth:** `requireActor()` and `getActorOrNull()` from `auth-helpers.ts` — don't use bare `getServerSession()`
- **Mobile-first:** Technicians use low-budget Android phones. Test mobile viewport FIRST, desktop second.
- **PDF:** NO backend PDF generation — use browser-native print with `@media print` / Tailwind `print:` modifiers only.
- **Error Logging:** ALL catch blocks MUST prefix with `[CPIS-ERROR] <Feature>.<Action>:`
- **Dashboard Activity:** No real-time updates — users must refresh page to see new activities
- **Attendance Export:** CSV only — Excel (.xlsx) NOT implemented despite FSD mentioning it
- **UI/UX Audit Complete:** See `docs/UI_AUDIT.md` — 3 P0, 4 P1, 5 P2 issues identified

## Active Decisions 🤔

- **Caching (CG-05):** Implemented but limited impact due to Client Components architecture. Cache works (hit/miss logged), but full benefits require Server Components migration. See `docs/PHASE_5_CACHING_REPORT.md`
- **Next Priority:** Browser UI Tests (`QA`)
- **Deferred:** Video attachments to Log Sheet (Scope `LS-ADJ`) — decision pending cost analysis
- **Deferred:** Summary Report Analytics (`SR-02`) — dashboard charts provide sufficient visibility
- **UI/UX Improvements:** Pending approval — see `docs/BACKLOG.md` for prioritized list

## Completed Recently ✅

- **Dashboard Charts (DB-02/DB-03)** — Approach/Ampere charts for Condenser/Evaporator fully implemented
- **Summary Report Attachments (SR-01)** — PDF uploads for Temuan, Blowdown, Suhu, Surat Jalan
- **Limit Breach Notifications (NT-01)** — Bell UI with unread count, triggered on log sheet submission
- **Work Reports** — Full approval workflow with signatures
- **DB-01 Dashboard Recent Activity** — Fully implemented with RBAC, 7d/30d range, infinite scroll
- **CG-05 Data Caching** — Next.js cache tags implemented (see `docs/CACHING.md`)
- **UI/UX Audit (2026-03-14)** — Comprehensive audit across all modules with 12 prioritized improvements

## NOT Implemented (For Reference) 🔴

These features exist in FSD but are NOT built:

| Feature                        | FSD Ref | Why Not Built                                     |
| ------------------------------ | ------- | ------------------------------------------------- |
| Log Sheet Request Form         | 4.3     | Requirements unclear — overlaps with Work Reports |
| Master Settings - Daftar Mesin | 4.7.3   | Machines managed within project context only      |
| Master Settings - Log Sheet    | 4.7.3   | No global log sheet settings needed               |

## Corrections & Preferences 🔧

- Use `sonner` for ALL toasts — NOT custom toast implementations
- Use Indonesian labels: "Ubah" (Edit), "Hapus" (Delete), "Tambah" (Add)
- **Interfaces:** `I*` prefix | **Types:** `T*` prefix (e.g., `IUser`, `TComponentProps`)
- **Files:** kebab-case | **Functions:** camelCase | **Components:** PascalCase
- **Server Actions:** `[verb][Noun]Action` | **Services:** `[verb][Noun]`
- NO `any` types — use `unknown` if uncertain

## Current Sprint Focus 🎯

- **Sprint:** UI/UX Improvements (Pending Approval)
- **Focus:** Review `docs/UI_AUDIT.md` and prioritize fixes
- **Next:** Implement P0 critical issues if approved
- **Off-limits:** Do NOT touch Log Sheet detail page (~437 lines) — already refactored in LS-STAB
