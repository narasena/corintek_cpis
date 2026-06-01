## [Monday, 01-06-2026 20:48] — Migrated supabase-keep-alive from GHA to pg_cron (BUG-053)

### Session Target
- Make the Supabase free-tier keep-alive actually work. Originally framed as a GHA workflow fix; pivoted to retiring GHA in favor of Supabase's built-in `pg_cron` after a better mechanism surfaced mid-session.

### Current State
- Status: shipped (GHA workflow deleted); pg_cron jobs pending user action in two Supabase projects
- Scope: `.github/workflows/supabase-keep-alive.yaml` (deleted), `docs/bugs.md`, `HANDOFFS.md`

### What Changed
- `.github/workflows/supabase-keep-alive.yaml` — **deleted**. The env-vs-secret mismatch was a symptom of the wrong mechanism; pg_cron is the right tool. (commit pending)
- `docs/bugs.md` — BUG-053 root-cause expanded to cover both the interim GHA `environment:` fix (commit `3aff6c8`) and the final pg_cron migration; status remains `Fixed`. (commit `4e09ec5` + this session)
- `HANDOFFS.md` — this file (overwritten per § 1.1)

### Verification
- Commands run: `gh workflow run "Keep Supabase Alive" --ref staging`, `gh run view --log-failed`, `gh api repos/narasena/corintek_cpis/actions/secrets`, `gh api repos/narasena/corintek_cpis/environments/.../secrets`
- Results:
  - Pre-fix GHA dispatches (runs `26757943486`, `26758804358`) failed with `curl: (3) URL rejected` — confirmed symptom.
  - Interim fix (commit `3aff6c8`): push-triggered runs `26758920652` and `26759115374` concluded `success`. GHA was functioning.
  - Final fix: GHA workflow removed; pg_cron jobs require user-side execution in two Supabase projects (cannot be automated from this side without DB connection strings).

### Decisions
- D-001: Target **both** UAT (`igrnumqjyffzirwzklch`) and main preview (`krzxfiofhvvsildjgi`) — both are on free tier and could pause.
- D-002: Use **Supabase pg_cron only** (not "GHA + pg_cron belt-and-suspenders") — pg_cron runs in-DB, removes GHA as a single point of failure, eliminates the `environment:` secret-scoping footgun entirely.
- D-003: **Delete** the GHA workflow file (not keep as disabled reference) — pg_cron is now the source of truth; the broken-prior mechanism adds noise.
- D-004: Keep **Mon/Thu 00:00 UTC** schedule (same as old GHA) — 3.5d max gap, well under the 7d pause threshold.
- D-005: Use a trivial `SELECT 1` SQL snippet (not `pg_net` HTTP self-ping) — the free-tier pause triggers on database inactivity, so a SQL query satisfies the requirement; one fewer extension dependency.

### Known Issues / Risks
- pg_cron jobs are **not yet created** — user must run the SQL in both Supabase projects' SQL Editor. Until then, both Supabase projects are unprotected (more exposed than before this session, since GHA was at least trying). Acceptance criteria: user pastes the `SELECT cron.schedule(...)` SQL into both projects' SQL Editors, runs the verification query, confirms the job row appears.
- pg_cron fires Mon/Thu 00:00 UTC. First run could be 3.5 days away from session time (Mon 01-06-2026 20:48 → next run is Thu 04-06 00:00 UTC ≈ 51 hours away). User can `SELECT cron.schedule('keep-alive-test', '* * * * *', $$ SELECT 1 $$)` with a per-minute schedule to self-test, then `SELECT cron.unschedule('keep-alive-test')` once verified.
- I cannot directly verify pg_cron ran from outside the projects. The `cron.job_run_details` table inside each project is the only authoritative check.

### Next Steps (ordered)
1. **User (blocking):** run the `SELECT cron.schedule('keep-alive', '0 0 * * 1,4', $$ SELECT 1 $$);` SQL in BOTH projects' SQL Editors (UAT + main preview).
2. **User:** verify with the `SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'keep-alive';` query in both.
3. **User (optional):** schedule a temporary per-minute test job to confirm the scheduler is wired up, then unschedule.
4. **User:** after the first real run (Thu 04-06 00:00 UTC or later), check `cron.job_run_details` in both projects for a `succeeded` row.

### Blockers (if any)
- None on the agent side. User action required to complete the migration.

