## [Monday, 01-06-2026 20:48] — Migrated supabase-keep-alive from GHA to pg_cron (BUG-053)

### Session Target
- Make the Supabase free-tier keep-alive actually work. Originally framed as a GHA workflow fix; pivoted to retiring GHA in favor of Supabase's built-in `pg_cron` after a better mechanism surfaced mid-session.

### Current State
- Status: shipped; pg_cron self-test **passed** in at least one project; full schedule (Mon/Thu 00:00 UTC) pending first real run on Thu 04-06.
- Scope: `.github/workflows/supabase-keep-alive.yaml` (deleted), `.github/workflows/.gitkeep` (added), `docs/bugs.md`, `HANDOFFS.md`

### What Changed
- `.github/workflows/supabase-keep-alive.yaml` — **deleted**. Env-vs-secret mismatch was a symptom of the wrong mechanism; pg_cron is the right tool. (commit `f3b916c`)
- `.github/workflows/.gitkeep` — added to preserve the now-empty workflows directory in git. (this session)
- `docs/bugs.md` — BUG-053 logged, then root-cause expanded to cover both the interim GHA `environment:` fix and the final pg_cron migration; status set to `Verified` after self-test pass. (commits `4e09ec5`, `f3b916c`, this session)
- `HANDOFFS.md` — this file (overwritten per § 1.1)

### Verification
- Commands run: `gh workflow run/view`, `gh api .../actions/secrets`, `gh api .../environments/.../secrets`, `git log`, `git push` (staging + development_v2).
- Results:
  - Pre-fix GHA dispatches (`26757943486`, `26758804358`) failed with `curl: (3) URL rejected` — confirmed symptom.
  - Interim fix (commit `3aff6c8`): push-triggered runs `26758920652` and `26759115374` concluded `success`. GHA was functioning.
  - Final fix: GHA workflow removed. User ran per-minute self-test in ≥1 project; `cron.job_run_details` returned 2 rows with `status='succeeded'` → **pg_cron is operational in that project**.
  - Self-test in the second project is **not yet confirmed** — see Risks.

### Decisions
- D-001: Target **both** UAT (`igrnumqjyffzirwzklch`) and main preview (`krzxfiofhvvsildjgi`).
- D-002: Use **Supabase pg_cron only**. Runs in-DB, removes GHA as a single point of failure, eliminates the `environment:` secret-scoping footgun.
- D-003: **Delete** the GHA workflow file (not keep as disabled reference). pg_cron is now the source of truth.
- D-004: Keep **Mon/Thu 00:00 UTC** schedule. 3.5d max gap, well under the 7d pause threshold.
- D-005: Use a trivial `SELECT 1` SQL snippet (not `pg_net` HTTP self-ping). Free-tier pause triggers on DB inactivity, so any query satisfies it; one fewer extension dependency.
- D-006: Add `.gitkeep` to `.github/workflows/` to preserve the now-empty directory in git.
- D-007: Land new commits on `development_v2` via merge commit (preserves dev_v2's 2 unique deploy/build commits).

### Knowledge Captured (for the user's reference)

**Why `SELECT 1` is enough:**
- The Supabase free-tier pause triggers on **database inactivity** (no queries for 7 days). Any successful query resets the timer — content doesn't matter, just that one ran.
- `SELECT 1` returns one row with the integer `1`, reads no tables, writes nothing, requires no schema. It is the canonical "is the DB alive?" probe used by connection poolers and health checks.
- Alternatives that would also work: `SELECT now()`, `SELECT version()`, `SELECT 1 AS keepalive`.

**Why pg_cron is more reliable than the GHA workflow it replaced:**

| Failure surface | GHA workflow | pg_cron |
|---|---|---|
| External dependency (GitHub uptime) | yes | none — runs in-DB |
| Runner availability / queueing | can queue during peak | none |
| Network: CI → Supabase public internet | yes, depends on auth/secrets | internal, no network |
| Secret-injection footgun (`environment:` scoping) | yes — this was the bug | none — DB has the URL by definition |
| Auth/credential expiry | possible | impossible (no creds) |
| GHA minutes quota | consumes them | free |
| Counts as DB activity for free-tier pause | only if curl succeeded | the cron firing itself counts |

The only way pg_cron can fail is if the Supabase project itself is paused/deleted/extinct.

**Failure modes to watch for (all unlikely):**
- `SELECT 1` errors — ~0% probability. `cron.job_run_details` would show `status='failed'`.
- Job gets toggled inactive — only if you/team do it manually. `cron.job` row would show `active=false`.
- pg_cron extension disabled — only if you do it manually. Jobs disappear from `cron.job`.
- Project pauses anyway — if Supabase's inactivity rule works differently than documented. Visible in dashboard.

### Known Issues / Risks
- **Second project self-test not yet confirmed.** User ran self-test in ≥1 project (saw 2 rows). If only one project was tested, the other is still exposed. Acceptance: user runs the per-minute self-test in the second project and confirms 2 rows back.
- **First real `keep-alive` run is ~51 hours away** (Thu 04-06 ~00:00 UTC). If you want multiple data points faster, `cron.alter_job` to `0 0 * * *` (daily) for 1–2 weeks, observe 7–14 runs, then back to `0 0 * * 1,4`.
- `cron.job_run_details` is **never auto-cleaned**. For a twice-weekly job, ~104 rows/year per project. Negligible.
- I cannot directly verify pg_cron from outside the projects. The `cron.job_run_details` table inside each project is the only authoritative check.

### Next Steps (ordered, for the user)
1. **Run the per-minute self-test in the second project** if not already done. Steps:
   ```sql
   SELECT cron.schedule('keep-alive-probe', '* * * * *', $$ SELECT 1 $$);
   -- wait 2-3 min
   SELECT start_time, status FROM cron.job_run_details
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'keep-alive-probe')
   ORDER BY start_time DESC LIMIT 5;
   SELECT cron.unschedule('keep-alive-probe');
   ```
2. **Set a calendar reminder for Thu 04-06 ~01:00 UTC.** Verify the real `keep-alive` job fired:
   ```sql
   SELECT start_time, status FROM cron.job_run_details
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'keep-alive')
   ORDER BY start_time DESC LIMIT 1;
   ```
   Expect one row, `status='succeeded'`.
3. **Optional paranoia:** tighten to daily for the first 2 weeks, observe, then back to Mon/Thu.
4. **Weekly health check (optional):** visit `https://supabase.com/dashboard/project/<project-ref>/integrations/cron/jobs` for each project. Visual run history.

### Blockers (if any)
- None on the agent side. User action required to confirm the second project and to verify the first real run on Thu 04-06.

