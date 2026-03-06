# ROLLBACK_PLAYBOOK

## 1) Purpose

Provide a fast and predictable rollback process for failed CPIS releases.

## 2) Rollback Triggers

- P1 incident introduced by latest release
- Data corruption risk detected
- Critical auth/RBAC regression
- Core workflow failure without immediate hotfix path

## 3) Rollback Decision Checklist

- [ ] Incident severity confirmed.
- [ ] Root cause linked to latest release.
- [ ] Rollback is lower risk than forward fix.
- [ ] Client PIC informed of rollback decision.

## 4) Execution Steps

1. Announce rollback start and expected timeline.
2. Revert to previous known-good release.
3. Validate environment health.
4. Run smoke tests:
   - auth flow
   - dashboard
   - log sheet save/submit
5. Confirm incident status to stakeholders.
6. Open root-cause follow-up ticket.

## 5) Rollback Record Template

- Rollback ID:
- Trigger incident ID:
- Started at:
- Completed at:
- Rolled back release:
- Restored release:
- Validation result:
- Follow-up owner:
