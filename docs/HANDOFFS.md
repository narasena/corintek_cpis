# Session Handoff — 2026-04-29 (Logsheet Optional Machine-Type Validation)

## Target: Allow chiller-only or cooling-tower-only logsheet submissions

**Branch:** `development_v2`

### Completed This Session

| Task | Status |
|------|--------|
| Analyze current validation logic requiring both machine types | ✅ Complete |
| Relax `validateMachineCategory` to skip when machine type inactive | ✅ Complete |
| Add overall guard requiring at least one machine type active | ✅ Complete |
| Make raw water check conditional on active CTs | ✅ Complete |
| Update `approval-validation` to also skip raw water when no CTs | ✅ Complete |
| Fix `GENERAL_CONDITION` note requirement (was incorrectly excluded) | ✅ Complete |
| Add 7 new unit tests covering chiller-only, CT-only, both-off, raw-water skip | ✅ Complete |
| Update 2 existing tests to match new behavior | ✅ Complete |
| Fix CT-only test data (duplicate prop, missing cycle raw water) | ✅ Complete |
| Full test run: targeted test files (43/43 passed) | ✅ Complete |

### Changes Made

| File | Change |
|------|--------|
| `src/features/log-sheets/validation.ts` | Skip type validation when `activeIds.length === 0`; add cross-type guard; make raw water conditional on `activeCTIds` |
| `src/features/log-sheets/approval-validation.ts` | Wrap raw water check in `if (activeCTs.length > 0)`; remove `GENERAL_CONDITION` exclusion from NOTE requirement |
| `src/features/log-sheets/validation.characterization.test.ts` | 7 new tests + 2 updated |
| `src/features/log-sheets/approval-validation.characterization.test.ts` | 3 new tests + data fix |

### Behavior Changes

| Scenario | Old Behavior | New Behavior |
|----------|-------------|-------------|
| Only chillers active (CTs all off) | Blocked: "Minimal satu Cooling Tower..." | ✅ Pass (consumption + chiller data required) |
| Only cooling towers active (chillers all off) | Blocked: "Minimal satu Chiller..." | ✅ Pass (consumption + CT data required) |
| Both machine types off | Blocked: same messages | ❌ Still blocked with generic "Minimal satu unit..." |
| Raw water required when CTs off | Still collected (bug) | ✅ Skipped (no CT → no raw water) |
| `GENERAL_CONDITION` note required | ❌ Not enforced (code excluded it) | ✅ Now enforced per UI |

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
