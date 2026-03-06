# RELEASE_CHECKLIST

## 1) Pre-Release Validation

- [ ] Scope is approved and issue IDs are listed.
- [ ] No unrelated feature scope mixed into release.
- [ ] `npm run lint` passes.
- [ ] `npm run test:run` passes.
- [ ] `npm run build` passes.
- [ ] Migration impact reviewed.
- [ ] Rollback steps are documented.
- [ ] Client PIC communication is prepared.

## 2) Deployment Window

- [ ] Confirm backup and rollback readiness.
- [ ] Deploy during agreed maintenance window.
- [ ] Record deployment start/end timestamps.
- [ ] Record version/tag/commit reference.

## 3) Post-Release Smoke Test

- [ ] Login and logout works.
- [ ] Dashboard loads normally.
- [ ] Log sheet save/submit works.
- [ ] Core CRUD routes work based on role.
- [ ] No critical errors in runtime logs.

## 4) Release Log Template

- Release ID:
- Date:
- Owner:
- Scope:
- Risk level:
- Rollback plan:
- Result:
