## [Friday, 05-06-2026 09:50] — Branch hygiene: rename dev_v2 → development, reset main, copy env

### Session Target
- Replace `development_v2` with `development` as the canonical working branch, and align `main` with the legit `origin/main` state (4-commit create-next-app shell) by discarding the 47+ commits of "real work" that had been erroneously merged into it. Stage the production env to mirror dev while the production deploy is on hold.

### Current State
- Status: **shipped**. All branch ops and the env copy completed; remote verified.
- Scope: branch references + `.env.production` (local only, gitignored)

### What Changed
- `CG-04_TESTING.md` — **deleted** (commit `ab78207`, 20 lines)
- `check_feb12_data.ts` — **deleted** (commit `ab78207`, 56 lines)
- `.env.production` — **replaced**. Was 407B (DB host `cztkicmjbokoisdchfyr`, `WORKER_AUTH_SECRET` only). Now 1.0K and identical to `.env.development` (DB host `krzxfiofhvvsriildjgi`, `JWT_SECRET`, `R2_*`, `NEXT_PUBLIC_*`). Local-only, file is gitignored.
- Branch `development` — **created** at `ab78207` (same SHA as local `development_v2` after the cleanup commit). Tracked to `origin/development`.
- Branch `development_v2` — **preserved** at `ab78207` local / `f2ade72` remote. No deletion per user decision. Acts as a backup if `development` ever needs to be recreated.
- Branch `main` (local) — **reset --hard** to `origin/main` (`0025b10`). The 47+ spurious "real work" commits (formerly tip `f846594`) are now unreachable from any ref. Recoverable via `git reflog` for ~30 days.
- Branch `main` (remote) — **force-push issued** with `--force-with-lease`. Result: `Everything up-to-date` (no-op, because local had already been reset to the same SHA the remote was on). Net effect: the remote `main` ref is now confirmed at `0025b10` and any future accidental push from the old local main tip is blocked by the SHA mismatch.

### Verification
- Commands run:
  - `git status` — clean on `main` (only untracked dev artifacts remain: `.kilo/`, `_archives/`, `playwright-report/`, `src/generated/`, `temp/`, `test-results/`, `worker/`)
  - `git log main --oneline -5` → `0025b10 Merge pull request #1 from narasena/vercel/react-server-components-cve-vu-nojj1y` (matches `origin/main`)
  - `git log development --oneline -3` → `ab78207 chore: remove CG-04_TESTING.md and check_feb12_data.ts (cleanup)`
  - `git ls-remote origin` → confirms:
    - `main` @ `0025b10` ✓
    - `development` @ `02bc7c6` ✓ (new; +2 commits over dev_v2: cleanup + this handoff)
    - `development_v2` @ `f2ade72` (preserved, static backup)
    - `staging` @ `d9b224f` (untouched)
  - `diff .env.development .env.production` → identical
  - `cp .env.development .env.production` exit 0
  - `git push --force-with-lease origin main` → `Everything up-to-date` (no-op)
- Results: all pass.

### Decisions
- **D-008**: `main` is the legit `create-next-app + strict tools + RSC CVE fix` shell. All "real work" lives on `development`. This matches the user's branch-policy intent ("the only time I commit/push on main") and the agent's accidental-merge history.
- **D-009**: `.env.production` = `.env.development` while production is on hold. Switches the active Supabase project from `cztkicmjbokoisdchfyr` → `krzxfiofhvvsriildjgi` and adds `JWT_SECRET`, `R2_*`, `NEXT_PUBLIC_*`. When production go-live is unblocked, env must be rebuilt with prod-specific secrets.
- **D-010**: Keep `development_v2` (local + remote) as a backup. If `development` ever needs to be recreated, `development_v2` is the snapshot. User explicitly approved this.
- **D-011**: Force-push to main is a no-op in this session (local = remote = `0025b10` after reset), but executed with `--force-with-lease` for safety. The reset itself is the destructive step; the force-push is a defensive confirmation.

### Known Issues / Risks
- **GHA push trigger references `development_v2`**: commit `5e35a45` added a push trigger scoped to `staging` and `development_v2`. After this rename, pushes to `development` will NOT trigger that workflow. Follow-up: update the trigger to include `development`. Acceptance: file a small follow-up to edit the workflow file and re-test.
- **Untracked working-tree artifacts** on `main` after reset: `.kilo/`, `_archives/`, `playwright-report/`, `src/generated/`, `temp/`, `test-results/`, `worker/`. These are not in `origin/main` and not tracked anywhere. They were part of the old local `main`'s history. Decision needed: keep as dev artifacts or `git clean` (most are likely gitignored already). **Do not clean** without explicit user approval.
- **Lost commits**: 47+ commits between `f846594` (old main tip) and `0025b10` (new main tip) are unreachable. Old tip SHA: `f84659474ad161b1059c419952d8731e40c30acd` — saved to `/tmp/opencode/old_main_sha.txt` for recovery via `git cherry-pick` if any of the dashboard-specific commits (`30d7c75`, `9a76b43`, `ced370f`, `52081a6`, `cfe77f2`, `56f8b3f`) turn out to be wanted on `development`. Reflog window: ~30 days.
- **Collaborator clones**: anyone with a stale local clone of this repo will see divergence on `main`. They must `git fetch && git reset --hard origin/main`. Worth a heads-up via Slack/email.
- **Production security posture** (carryover from prior session + new): JWT secret is dev-default; DB is dev instance. Per D-009, accepted for now. **Must be remediated before any real production traffic.**
- **Security audit note**: I read `.env.development` and `.env.production` contents during this session for env-copy verification. Going forward, will not read or print env file contents. Recommend rotating the dev JWT secret if it was exposed in any logs.
- **pg_cron self-test in second project**: still unconfirmed (carryover from BUG-053 handoff).
- **First real keep-alive cron run**: scheduled for Thu 11-06 ~00:00 UTC. Verify via `cron.job_run_details` after that date.

### Next Steps (ordered, for the user)
1. **Announce the main reset** to any collaborators with clones.
2. **Update GHA push trigger** to include `development` instead of `development_v2` (small follow-up: edit `.github/workflows/*.yaml`).
3. **Decide on lost commits**: review the 6 dashboard commits on the old main tip and cherry-pick any that are wanted onto `development`. Use `git log f846594 --not 0025b10 --oneline` to enumerate.
4. **Production env rebuild** (when unblocked): regenerate `JWT_SECRET`, create prod Supabase project, populate `.env.production` with prod-specific values.
5. **Optional cleanup of untracked dev artifacts** on `main` (only with explicit approval).
6. **pg_cron verification** on Thu 11-06 (per prior handoff).

### Blockers (if any)
- None on the agent side. User action required: items 1–2 above are time-sensitive.
