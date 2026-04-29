# Session Handoff — 2026-04-29 (UAT Environment Setup & Security Fix)

> **⚠ TOP PRIORITY — Development Handoff Required**  
> The `prisma/seed.ts` file previously contained hardcoded admin credentials (`admin@corintek.com / Corintek123!`). These have been externalized to environment variables for UAT. The development branch still uses hardcoded values and must be updated. Do not deploy or share any code until development branch is fixed. See: `docs/CONTEXT.md` → "Active Gotchas ⚠️" (add entry: "Secrets: Never hardcode credentials — use env vars SEED_ADMIN_EMAIL/PASSWORD")".

## Target: Create isolated UAT environment with secure seeding

**Branch:** `staging/uat-setup` (new)

### Completed This Session

| Task | Status |
|------|--------|
| Create Supabase UAT project (free tier, ap-northeast-1) | ✅ Complete |
| Configure `.env.uat` with UAT DB credentials and R2 worker | ✅ Complete |
| Add UAT-specific npm scripts (`prisma:seed:uat`, etc.) | ✅ Complete |
| Create dedicated branch `staging/uat-setup` for UAT | ✅ Complete |
| Fix seed script for new Parameter schema (ParameterLimit split) | ✅ Complete |
| Secure admin credentials: moved to `SEED_ADMIN_EMAIL/PASSWORD` env vars | ✅ Complete |
| Add SEED_CREATE_ADMIN flag to control admin seeding per environment | ✅ Complete |
| Seed UAT database (admin + parameters + limits) | ✅ Complete |

### Changes Made

| File | Change |
|------|--------|
| `.env.uat` | Added `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_CREATE_ADMIN=true` |
| `prisma/seed.ts` | Replaced hardcoded admin credentials with env vars; added `hasLimits` to Parameter seeding; created `ParameterLimitProfile` with limits for 23 numeric parameters |
| `package.json` | Added `prisma:*:uat` scripts for migrations, seed, studio, generate, push, status |

### UAT Environment Details

- **Supabase Project:** `corintek-cpis-uat` (ap-northeast-1)
- **Database:** PostgreSQL via connection pooling
- **Branch:** `staging/uat-setup`
- **Deployment:** Preview deployment configured (Vercel or similar)
- **Admin Credentials (UAT):**
  - Email: `admin@corintek.com`
  - Password: `CorintekUAT123!@#`
  - **Security:** Unique to UAT, different from development

### Next Steps (Critical)

1. **Fix Development Branch** (`development_v2`):
   - Update `prisma/seed.ts` on `development_v2` to also use env vars (avoid hardcoded secrets)
   - Create `.env.development` entries: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_CREATE_ADMIN=true`
   - Commit as: `feat(security): externalize seed admin credentials to env vars`
   - **Priority:** HIGH — addresses security vulnerability

2. **Production Planning**:
   - For `main`/production: set `SEED_CREATE_ADMIN=false` in `.env.production`
   - Create initial admin via secure invite flow (not seeding)
   - Document production bootstrapping process in `docs/PRODUCTION_SETUP.md`

3. **Client Handover**:
   - Share UAT preview URL with client
   - Provide UAT admin credentials (use password manager)
   - Document UAT reset procedure (delete Supabase project, rerun migrations + seed)

### Security Notes

- **Never commit hardcoded credentials** (even in private repos).
- Use branch-specific env files to inject secrets at runtime.
- Rotate UAT admin password after client acceptance.
- Consider adding `.env*` check to pre-commit hooks (if not already present).

### Migration Status

- UAT database fully seeded and operational.
- All 23 parameters + limits created under `Default Profile`.
- Parameter schema changes accommodated in seed (limits moved to `ParameterLimit` table).

---
### Why This Change?

Field technicians often service only chillers OR only cooling towers on a given day. The existing "active machine" toggle already signals intent. Forcing data entry for inactive machine types creates unnecessary friction and does not match field reality.

### Verification

```bash
npm run test:run -- src/features/log-sheets/validation.characterization.test.ts \
  src/features/log-sheets/approval-validation.characterization.test.ts \
  src/features/log-sheets/service.test.ts
```

All 43 tests pass.

---

# Session Handoff — 2026-04-29 (Camera Black Capture)

## Current Status: Fix Applied — Build Passing

**Branch:** `development_v2`

### Completed This Session

| Task | Status |
|------|--------|
| Diagnose water meter camera black first capture | ✅ Complete |
| Identify root cause | ✅ Complete — camera stream was stopped before canvas copied video pixels |
| Fix capture order in `CameraInput` | ✅ Complete |
| Remove forced camera-ready fallback | ✅ Complete |
| Log bug as BUG-049 | ✅ Complete |
| Run production build | ✅ Passed (`npm run build`) |

### Root Cause

`src/components/camera-input.tsx` called `stopCamera()` before `processImagePipeline(video, ...)`. On mobile browsers, stopping `MediaStreamTrack`s can immediately blank the hardware-backed `<video>` surface. Canvas then draws black pixels even though the preview was visible just before capture.

### Fix

Capture/compress from active video first, then stop the camera after canvas processing succeeds. Camera button readiness still waits for `video.readyState >= 2`, but no longer has a forced timeout fallback that can enable capture before the video is drawable.

### Files Modified

1. `src/components/camera-input.tsx` — capture order and readiness cleanup
2. `docs/bugs.md` — added BUG-049
3. `docs/HANDOFFS.md` — current session state

### Verification

- `npm run build` passed.

### Cold Start Action

Test on deployed Vercel/mobile Android: open logsheet water meter camera, wait for preview, capture once. Expected: first capture matches preview and is not black.

---

# Session Handoff — 2026-03-14 (UI/UX Audit)

**Critical (P0) Issues Found:** 3
- Work Reports header misalignment (mobile)
- Incomplete mobile navigation coverage
- Accessibility (focus + contrast)

**Major (P1) Issues Found:** 4
- Visual inconsistency (typography/spacing)
- Loading states inconsistency
- Error messages not informative
- DataTable no virtualization

**Minor (P2) Issues Found:** 5
- Login mixed language
- Parameter page tab crowding
- File input UX poor
- Attendance view duplication
- Dashboard decoration

---

## Files Created/Modified

1. `docs/UI_AUDIT.md` — NEW — Full audit report with priorities
2. `docs/BACKLOG.md` — Updated — Added 12 UI-UX items

---

## Next Steps (Cold Start Actions)

1. Review `docs/UI_AUDIT.md` for full details
2. Approve implementation plan
3. Begin Phase 1 fixes (P0 critical issues)

---

## Active Branch

`development_v2`
