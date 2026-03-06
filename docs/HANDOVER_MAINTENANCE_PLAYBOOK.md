# CPIS Handover & Maintenance Playbook

> Project: Corintek Project Information System (CPIS)  
> Phase: Handover Preparation  
> Maintainer Model: Solo SWE (primary), Client PIC (operational liaison)

## 1) Purpose

This playbook defines how CPIS should be maintained safely during and after handover, without introducing hidden access paths or undocumented operational shortcuts.

Primary goals:

1. Keep production stable during transition.
2. Reduce single-person dependency risk.
3. Ensure incidents are handled predictably and transparently.
4. Make maintenance auditable, repeatable, and contract-safe.

## 2) Scope and Boundaries

### In Scope

- Bug triage and production issue handling
- Release and rollback process
- Operational runbooks and handover artifacts
- Post-handover support protocol

### Out of Scope

- New feature development unrelated to stability
- Architecture rewrites during handover window
- Hidden backdoors or undocumented privileged routes

## 3) Operating Principles

1. Stability over novelty.
2. Fix root causes before cosmetic improvements.
3. Every change has rollback instructions.
4. No production change without traceability.
5. Documentation is part of delivery, not optional.

## 4) Handover-Phase Strategy (2 Weeks)

### Week 1 — Stabilize Operations

- Freeze non-critical scope.
- Build issue severity matrix and response SLA.
- Prepare release checklist and rollback checklist.
- Validate monitoring and error triage workflow.
- Run one incident simulation.

### Week 2 — Transfer Knowledge

- Finalize maintainer document package.
- Record walkthrough sessions for critical flows.
- Run handover workshop with client-side PIC.
- Execute sign-off checklist.
- Start post-handover support window.

## 5) Incident Severity & SLA

| Severity | Definition | Examples | First Response | Target Resolution |
| :-- | :-- | :-- | :-- | :-- |
| P1 Critical | Core workflow unavailable, no workaround | Login failure for all users, database outage | ≤ 1 hour | Same day |
| P2 High | Core workflow degraded, workaround exists | Log sheet save intermittently fails | ≤ 4 hours | ≤ 24 hours |
| P3 Medium | Non-core issue, low business impact | Export formatting issue | ≤ 1 business day | Next maintenance batch |
| P4 Low | Cosmetic or enhancement request | Minor UI copy or alignment | Next maintenance cycle | Planned only |

## 6) Must-Do / Should-Do / Not-To-Do

### Must-Do

- Keep production change log with date, owner, reason, and impact.
- Run verification checks before release:
  - `npm run lint`
  - `npm run test:run`
  - `npm run build`
- Prepare rollback action before deployment.
- Attach incident ID for every hotfix.
- Keep access control changes documented and approved.
- Update relevant docs immediately after operational changes.

### Should-Do

- Maintain weekly health check summary (open bugs, MTTR, recurring issues).
- Record short walkthrough videos for top 5 critical operations.
- Maintain known-issues list with workarounds.
- Keep dependency update cadence predictable (batch updates).
- Review logs weekly for repeated failure patterns.

### Not-To-Do

- Do not create hidden/backdoor access paths.
- Do not deploy directly without checklist and rollback path.
- Do not mix feature scope into emergency hotfixes.
- Do not bypass role-based controls for convenience.
- Do not leave temporary debug logic in production.
- Do not rely on memory for incident handling steps.

## 7) Critical Documents Required for Maintainers

The following docs are required as maintenance baseline.

| Document | Path | Purpose | Owner | Priority |
| :-- | :-- | :-- | :-- | :-- |
| System Architecture | `docs/STRUCTURE.md` | Understand boundaries, modules, and data flow | SWE | Must |
| Product Scope & Feature Status | `docs/ROADMAP.md` | Prevent uncontrolled scope changes | SWE + PM | Must |
| Architectural Decisions | `docs/DECISIONS.md` | Preserve rationale and constraints | SWE | Must |
| Changelog | `docs/CHANGELOG.md` | Release traceability and audit history | SWE | Must |
| Maintenance Contract Context | `docs/wbs/MAINTENANCE_PROPOSAL.md` | SLA and service boundary alignment | SWE + Client PIC | Must |
| Handover Playbook | `docs/HANDOVER_MAINTENANCE_PLAYBOOK.md` | Operational governance during transition | SWE | Must |

## 8) Additional Docs That Should Exist Before Final Handover

Create and maintain these operational docs during handover:

1. `docs/ops/INCIDENT_RUNBOOK.md`
2. `docs/ops/RELEASE_CHECKLIST.md`
3. `docs/ops/ROLLBACK_PLAYBOOK.md`
4. `docs/ops/ACCESS_CONTROL_REGISTER.md`
5. `docs/ops/KNOWN_ISSUES.md`
6. `docs/ops/CHANGE_REQUEST_LOG.md`
7. `docs/ops/POST_HANDOVER_SUPPORT.md`

## 9) Release Control Checklist

Use this checklist for every production release.

1. Scope approved and linked to issue IDs.
2. Code quality checks pass:
   - `npm run lint`
   - `npm run test:run`
   - `npm run build`
3. Database migration risk reviewed.
4. Rollback plan written and tested for plausibility.
5. Communication prepared for client PIC.
6. Post-release smoke tests executed on critical flows:
   - Login/authentication
   - Dashboard load
   - Log sheet save/submit
   - User management access

## 10) Emergency Hotfix Protocol

1. Classify incident severity (P1–P4).
2. Open incident record with timestamp and owner.
3. Isolate minimal fix scope.
4. Validate in local/staging path.
5. Deploy with rollback ready.
6. Confirm production behavior.
7. Publish post-incident summary (root cause, fix, prevention).

## 11) Knowledge Transfer Checklist

Before handover sign-off, confirm:

- Architecture walkthrough completed.
- Deployment + rollback walkthrough completed.
- Incident runbook walkthrough completed.
- Access and role administration walkthrough completed.
- Client PIC knows escalation path and SLA.
- All required docs are accessible and updated.

## 12) Post-Handover 30-Day Support Model

- Week 1: Daily check-in for stabilization.
- Week 2: Every 2–3 days check-in, prioritize P1/P2.
- Week 3–4: Weekly structured review of incidents and changes.
- End of month: Formal maintenance review and next-phase recommendation.

## 13) Decision Rules for Future Changes

Use this filter before accepting work during maintenance:

1. Does it reduce current incident risk?
2. Is it required for contract/SLA obligations?
3. Can it be rolled back quickly if needed?
4. Is documentation updated as part of the change?

If answer is no for most items, defer to backlog instead of immediate implementation.

## 14) Final Recommendation

For CPIS handover, the safest path is:

- No backdoor or hidden privileged panel.
- Strong release discipline.
- Strong incident handling discipline.
- Explicit documentation package for maintainers.

This reduces operational risk, legal ambiguity, and support chaos while keeping maintenance sustainable for a solo freelance model.
