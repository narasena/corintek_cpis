# CPIS — Maintenance Service Proposal

> **Project:** Corintek Project Information System (CPIS)
> **Developer:** [Your Name]
> **Date:** 2026-03-03
> **Effective From:** [Date after project delivery]

---

## 1. Scope of Maintenance

This proposal covers ongoing maintenance for the CPIS application post-delivery. Maintenance includes:

- 🐛 **Bug Fixes** — Resolving defects in existing functionality
- 🔒 **Security Patches** — Applying dependency updates & vulnerability fixes
- 🔧 **Minor Adjustments** — Small UI tweaks, text changes, configuration updates
- 📊 **Monitoring** — Basic application health monitoring (Standard & Premium)
- 💾 **Database** — Schema integrity checks, migration support

### Excluded from Maintenance

- ❌ **New Features** — Require separate contract/addendum
- ❌ **Data Migration** — From legacy systems (separate scope)
- ❌ **Infrastructure Changes** — Hosting migration, domain changes
- ❌ **Training** — User or admin training sessions

---

## 2. Service Tiers

### Tier 1 — Basic (Rp 750,000/month)

| Aspect            | Detail                                     |
| :---------------- | :----------------------------------------- |
| **Max Hours**     | 4 hours/month                              |
| **Communication** | Email only                                 |
| **Availability**  | Business days (Mon-Fri, 09:00-17:00 WIB)   |
| **Response Time** | Within 48-72 hours                         |
| **Bug Fix SLA**   | Best effort, within 5 business days        |
| **Monitoring**    | None (reactive only)                       |
| **Best For**      | Stable system with minimal expected issues |

### Tier 2 — Standard (Rp 2,500,000/month)

| Aspect            | Detail                                         |
| :---------------- | :--------------------------------------------- |
| **Max Hours**     | 20 hours/month                                 |
| **Communication** | Chat (WhatsApp/Telegram) + Email               |
| **Availability**  | Business hours (Mon-Fri, 09:00-17:00 WIB)      |
| **Response Time** | Within 24 hours                                |
| **Bug Fix SLA**   | Minor: 2 business days, Major: 5 business days |
| **Monitoring**    | Monthly health check report                    |
| **Best For**      | Active system with regular usage               |

### Tier 3 — Premium (Rp 4,500,000/month)

| Aspect            | Detail                                      |
| :---------------- | :------------------------------------------ |
| **Max Hours**     | 40 hours/month                              |
| **Communication** | Chat + Phone/Video call                     |
| **Availability**  | Including weekends & holidays               |
| **Response Time** | Within 4 hours                              |
| **Bug Fix SLA**   | Minor: <4 hours, Major: <48 hours           |
| **Monitoring**    | Weekly health check + proactive monitoring  |
| **Priority**      | Queue priority over Basic/Standard clients  |
| **Best For**      | Critical system requiring high availability |

---

## 3. Terms & Conditions

### Billing

- **Contract Period:** Minimum 3 months
- **Payment:** Due by 5th of each month (advance)
- **Late Payment:** Service paused after 10-day grace period

### Hours

- **Rollover:** Unused hours do NOT roll over to next month
- **Overage Rate (Basic/Standard):** Rp 100,000/hr
- **Overage Rate (Premium):** Rp 125,000/hr
- **Overage Approval:** Required before exceeding monthly cap

### Bug Severity Definitions

| Severity     | Definition                             | Example                                      |
| :----------- | :------------------------------------- | :------------------------------------------- |
| **Critical** | System unusable, data loss risk        | Login broken, data corruption                |
| **Major**    | Core feature broken, workaround exists | Log sheet can't save, but old entries intact |
| **Minor**    | Non-blocking issue, cosmetic           | Button misalignment, text typo               |

### Escalation Path

1. Report bug via agreed communication channel
2. Developer acknowledges within Response Time SLA
3. Developer provides diagnosis and estimated fix time
4. Fix deployed, confirmation sent

---

## 4. New Features & Enhancements

Any work outside the maintenance scope — including but not limited to:

- New pages or modules
- Database schema changes for new functionality
- Integration with new external services
- UI/UX redesign

...will require a **separate addendum or contract**, quoted based on a Work Breakdown Structure with PERT estimation at the prevailing hourly rate.

**Current hourly rate:** Rp 85,000/hr (mid-level developer)

---

## 5. Tier Comparison

| Feature           | Basic  | Standard | Premium |
| :---------------- | :----: | :------: | :-----: |
| Max Hours         |   4    |    20    |   40    |
| Price/Month       |  750k  |   2.5M   |  4.5M   |
| Effective Rate/Hr | 187.5k |   125k   | 112.5k  |
| Email             |   ✅   |    ✅    |   ✅    |
| Chat              |   ❌   |    ✅    |   ✅    |
| Phone/Call        |   ❌   |    ❌    |   ✅    |
| Response SLA      | 48-72h |   <24h   |   <4h   |
| Weekends          |   ❌   |    ❌    |   ✅    |
| Health Checks     |   ❌   | Monthly  | Weekly  |
| Priority Queue    |   ❌   |    ❌    |   ✅    |

> **Note:** The effective rate per hour _decreases_ at higher tiers — the client gets better value with commitment.

---

## 6. Recommendation

For a system like CPIS with ~40 internal users and field technicians:

- **If usage is light (1-2 reports/week):** Tier 1 (Basic) is sufficient
- **If usage is daily (active projects):** Tier 2 (Standard) recommended
- **If system is business-critical (client SLA depends on it):** Tier 3 (Premium) required

---

> **Acceptance:** Client selects preferred tier and signs this proposal to activate maintenance service.
>
> |                    |                                |
> | :----------------- | :----------------------------- |
> | **Client Name:**   | ************\_\_\_************ |
> | **Tier Selected:** | ☐ Basic ☐ Standard ☐ Premium   |
> | **Start Date:**    | ************\_\_\_************ |
> | **Signature:**     | ************\_\_\_************ |
> | **Date:**          | ************\_\_\_************ |
