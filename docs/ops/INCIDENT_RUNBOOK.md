# INCIDENT_RUNBOOK

## 1) Purpose

Standard response process for production incidents in CPIS.

## 2) Severity Matrix

| Severity | Definition | Example | First Response | Resolution Target |
| :-- | :-- | :-- | :-- | :-- |
| P1 | Service unavailable, no workaround | Login fails for all users | ≤ 1 hour | Same day |
| P2 | Core flow degraded | Log sheet cannot save for subset | ≤ 4 hours | ≤ 24 hours |
| P3 | Non-core issue | Report filter inconsistent | ≤ 1 business day | Planned batch |
| P4 | Cosmetic | UI text or spacing | Next cycle | Planned |

## 3) Response Workflow

1. Open incident record (ID, time, reporter, environment).
2. Classify severity.
3. Acknowledge timeline to client PIC.
4. Reproduce and isolate root cause.
5. Prepare minimal fix and rollback plan.
6. Validate with smoke checks.
7. Deploy and monitor.
8. Close with post-incident summary.

## 4) Incident Record Template

- Incident ID:
- Severity:
- Reported by:
- Reported at:
- Affected module:
- User impact:
- Root cause:
- Fix summary:
- Rollback needed: Yes/No
- Closed at:

## 5) Post-Incident Summary Template

- Incident ID:
- What happened:
- Why it happened:
- What fixed it:
- Preventive actions:
- Related documentation updates:
