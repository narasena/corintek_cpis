## [Friday, 05-06-2026 10:28] — Branch rename + dev → staging → main promotion (job-application repo)

### Session Target
- Two-part session: (1) replace `development_v2` with `development`, reset `main` to the legit create-next-app shell, and copy dev env to prod env. (2) Promote the dev work to `staging` and `main` (fast-forward only) so the repo is presentable for a job application.

### Current State
- Status: **shipped**. All branches promoted; remote verified.
- Scope: branch references, `.env.production` (local, gitignored), git history.

### What Changed
- **Cleanup commit** `ab78207` — deleted `CG-04_TESTING.md` (20 lines) and `check_feb12_data.ts` (56 lines). Working-tree debris from prior session.
- **Branch `development`** — created at `ab78207` (same SHA as `development_v2` after the cleanup commit). Pushed to `origin/development`.
- **Branch `development_v2`** — preserved at `f2ade72` remote / `ab78207` local. Static backup per user decision: "if dev_v2 will undergo some changes, all good, we should use that as backup".
- **Branch `main` (local)** — reset `--hard` to `origin/main` (`0025b10`) at 09:50. Discarded the 47+ spurious "real work" commits. Recoverable via `git reflog` for ~30 days.
- **Branch `main` (remote)** — was force-pushed at 09:50 to `0025b10`; re-promoted at 10:28 via fast-forward to `17d2314` (the new dev work). Force-push was a no-op the first time (local = remote = `0025b10`); the second push was a regular FF, not force.
- **Branch `staging`** — fast-forward merged from `development` (5 commits: `8722674`, `5369b80`, `ab78207`, `02bc7c6`, `959407c`, `17d2314`). Pushed to `origin/staging`.
- **`.env.production`** — replaced. Was 407B (DB host `cztkicmjbokoisdchfyr`, `WORKER_AUTH_SECRET` only). Now 1.0K and identical to `.env.development` (DB host `krzxfiofhvvsriildjgi`, `JWT_SECRET`, `R2_*`, `NEXT_PUBLIC_*`). Local-only, file is gitignored.
- **HANDOFFS.md** — three commits: `02bc7c6` (record session), `959407c` (correct SHA), `17d2314` (stop chasing SHA). All on `development`, now also on `staging` and `main`.

### Verification
- Pre-merge ancestry checks (before any push):
  - `git merge-base --is-ancestor origin/staging development` → **true** (staging FF-able)
  - `git merge-base --is-ancestor origin/main development` → **true** (main FF-able)
  - `git log development ^origin/staging --oneline` → 6 commits ahead of staging
  - `git log development ^origin/main --oneline` → 849 commits ahead of main
- Auto-deploy audit: `.github/workflows/` contains only `.gitkeep` (the supabase-keep-alive workflow was deleted in commit `f3b916c` per BUG-053). **No CI/CD will trigger on push to main.**
- Push dry-runs both succeeded with expected ref updates (`d9b224f..17d2314` for staging, `0025b10..17d2314` for main).
- Final `git ls-remote origin`:
  - `main` @ `17d2314` ✓
  - `staging` @ `17d2314` ✓
  - `development` @ `17d2314` ✓
  - `development_v2` @ `f2ade72` (preserved, static backup)
- Working tree on `main` post-merge: clean (untracked dev artifacts `.kilo/`, `_archives/`, `playwright-report/`, `src/generated/`, `temp/`, `test-results/`, `worker/` are not in `origin/main` and not tracked anywhere — not committed).

### Decisions
- **D-008**: `main` is now a showcase of the real work (not a clean shell). User reversed D-008 from the first half of this session after clarifying intent: "main is unused anyway for now, the previous reset is just me thinking it would be different. I wanna use this repo as my project example [for a job application]." Net: main now contains all the development work, identical to staging and development.
- **D-009**: `.env.production` = `.env.development` (intentional, unchanged from prior decision). Production deploy remains on hold.
- **D-010**: `development_v2` kept as static backup (unchanged from prior decision).
- **D-011**: All promotions via `git merge --ff-only`. No merge commits created. Linear history preserved.
- **D-012**: Main push was a regular fast-forward, NOT a force-push. The earlier `--force-with-lease` was for the reset; this push is a clean FF. No data loss on remote.
- **D-013**: Three working branches (`main`, `staging`, `development`) now share the same tip. Intentional — they represent the same code at different "intent" levels: main = public/job-app showcase, staging = integration testing, development = active dev line. None of them are auto-deploying in the current workflow setup.

### Known Issues / Risks
- **Main, staging, development at same SHA**: any future change to development will only land on development until a manual promotion. Risk: drift. Mitigation: always promote through the chain (dev → staging → main) when shipping.
- **`.env.production` mirrors dev**: if any CI/CD is added later that deploys on main push, it will use dev credentials. Per D-009, accepted. Mitigation: rebuild env before any production deploy is enabled.
- **Job application exposure**: `main` now publicly shows real project code. If applying externally, be aware: the README, FSD, and project structure are visible. Recommend a quick `git log --oneline --all --graph` review to make sure no PII, secrets, or internal notes are in history. (None spotted in handoff; full audit not done.)
- **GHA push trigger still references `development_v2`**: commit `5e35a45` added a push trigger scoped to `staging` and `development_v2`. The trigger was in the deleted `supabase-keep-alive.yaml` workflow, so the file no longer exists — the trigger is effectively dead. No action needed.
- **Lost commits** (from prior session, still relevant): the 6 dashboard commits on the old main tip (`f846594`) remain unreachable. SHA saved to `/tmp/opencode/old_main_sha.txt` (likely expired). Recoverable via `git reflog` only if you remembered the SHA: `f84659474ad161b1059c419952d8731e40c30acd`. Beyond that, gone. If any of `30d7c75`, `9a76b43`, `ced370f`, `52081a6`, `cfe77f2`, `56f8b3f` are actually wanted, cherry-pick before reflog expires.
- **Production security posture** (carryover): JWT secret = dev-default, DB = dev instance. Per D-009, accepted for now. **Must be remediated before any real production traffic.**
- **pg_cron self-test in second project** (carryover from BUG-053): still unconfirmed.
- **First real keep-alive cron run**: scheduled for Thu 11-06 ~00:00 UTC.

### Next Steps (ordered, for the user)
1. **Audit `main` for the job application**: skim the README, FSD, and project tree. If anything looks off for a public-facing showcase, consider a follow-up commit to fix or `git rebase` to rewrite history (heavily destructive — only do this BEFORE going public with the repo).
2. **Decide on lost commits** (see Risks): review the 6 dashboard commits and cherry-pick any that are wanted onto `development`. **Time-sensitive** — reflog window is ~30 days.
3. **Optional cleanup of untracked dev artifacts** on `main` (only with explicit approval).
4. **Production env rebuild** (when unblocked): regenerate `JWT_SECRET`, create prod Supabase project, populate `.env.production` with prod-specific values.
5. **pg_cron verification** on Thu 11-06 (per prior handoff).

### Blockers (if any)
- None on the agent side. User action: item 1 is most time-sensitive for the job application.
