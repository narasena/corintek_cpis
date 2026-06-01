## [Monday, 01-06-2026 20:48] — Diagnosed & fixed supabase-keep-alive cron failure (BUG-053)

### Session Target
- Make the "Keep Supabase Alive" GitHub Action ping the Supabase REST API successfully instead of exiting with `curl: (3) URL rejected`.

### Current State
- Status: shipped
- Scope: `.github/workflows/supabase-keep-alive.yaml`, `docs/bugs.md`

### What Changed
- `.github/workflows/supabase-keep-alive.yaml` — added `environment: Preview` to the `ping` job so the env-scoped `SUPABASE_URL` and `SUPABASE_ANON_KEY` secrets are injected into the run context. (commit `3aff6c8`)
- `docs/bugs.md` — logged BUG-053 (P3, Fixed) with root-cause analysis; added row to P3 table, detailed entry, updated summary counts (P3 5→6, total 52→53), refreshed `_Last updated` date. (commit `4e09ec5`)

### Verification
- Commands run: `gh workflow run "Keep Supabase Alive" --ref staging`, `gh run view --log-failed`, `gh api repos/narasena/corintek_cpis/actions/secrets`, `gh api repos/narasena/corintek_cpis/environments/.../secrets`
- Results:
  - First manual dispatch (pre-fix) failed with exit 3 — confirmed the symptom.
  - Local edit alone did not propagate; re-dispatch against pre-push `staging` still failed.
  - After commit `3aff6c8` pushed to `staging`, push-triggered run `26758920652` concluded `success`. Log now shows secrets as `***` (masked) with a real host, no more empty values.
  - Subsequent docs-commit push triggered run `26759115374` → `success` (regression check: change is stable).

### Decisions
- D-001: Target `Preview` env (not `Preview – corintek-cpis` or repo-level) — the user-selected fix path. Most generic env with the required secrets; keeps the env-isolation architecture intact. Tradeoff: the cron will ping the `Preview` Supabase project specifically; if `Preview` is paused separately, the same bug pattern could recur.
- D-002: Skip defensive guard step (the pre-check `:` parameter expansion that would fail fast with a clear error) — user opted for the minimal change only. Tradeoff: future env/secret regressions will still surface as cryptic `curl: (3)` errors, not "SUPABASE_URL secret is not set".
- D-003: Direct-commit to `staging` instead of feature branch + PR — user explicitly overrode AGENTS.md § 7 protection for this fix. Tradeoff: bypasses code review; mitigated by the workflow itself running as a self-test on push.

### Known Issues / Risks
- The `Preview` env target is a guess about which Supabase project the user actually wants to keep alive. If the intent was a different env (e.g., `Preview – corintek-cpis` for the main app DB), the cron is pinging the wrong project. Acceptance criteria for the user to confirm: `Preview` env's `SUPABASE_URL` points to the Supabase project whose inactivity pause you want to prevent.
- The same pattern (env-scoped secrets + workflow missing `environment:`) could exist in other workflows in `.github/workflows/`. Not audited this session. Acceptance criteria for follow-up: grep all `secrets.*` references in workflows and verify each job either targets the env that owns them, or moves secrets to repo level.
- The defensive guard that would have caught this immediately was declined (D-002). The failure mode for any future regression is again a silent cron failure with a cryptic curl error.

### Next Steps (ordered)
1. User: confirm `Preview` env's `SUPABASE_URL` is the right Supabase project for keep-alive.
2. User: decide whether to add the defensive guard step in a follow-up.
3. Optional: audit `.github/workflows/*.yaml` for the same env-vs-secrets mismatch pattern.

### Blockers (if any)
- none
