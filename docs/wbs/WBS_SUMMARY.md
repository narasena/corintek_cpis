# CPIS — Work Breakdown Structure (Summary)

> **Project:** Corintek Project Information System (CPIS)
> **Prepared by:** Deep Scan (Gemini CLI)
> **Date:** 2026-03-04
> **Version:** Executive Summary — Deep Scan (Final)
> **Rate:** Mid-Level Developer — **Rp 85,000/hr**

---

## Project Valuation Summary

| #      | Epic                    | Scope                                                            | Expected Hours |     Cost (IDR) |
| :----- | :---------------------- | :--------------------------------------------------------------- | -------------: | -------------: |
| EP-001 | Auth & Session          | Login, JWT, RBAC, middleware, E2E auth setup                     |          39.69 |      3,373,650 |
| EP-002 | User Management         | CRUD, roles, soft delete, profile, avatar                        |          44.33 |      3,768,050 |
| EP-003 | Client Management       | CRUD, DataTable, soft delete, validation                         |          23.82 |      2,024,700 |
| EP-004 | Project Management      | CRUD, status, assignments, personnel, addenda                    |          52.03 |      4,422,550 |
| EP-005 | Machine Management      | Nested CRUD in projects, type/status enums                       |          15.58 |      1,324,300 |
| EP-006 | Chemical Management     | Master CRUD + log sheet usage integration                        |          23.00 |      1,955,000 |
| EP-007 | Attendance & Absence    | Clock in/out, photo, admin view, CSV export                      |          26.24 |      2,230,400 |
| EP-008 | Lab Analysis            | Results tracking, dynamic columns, forms, print                  |          27.33 |      2,323,050 |
| EP-009 | Parameters & Profiles   | Master data, categories, limits, profiles, batch ops             |          51.77 |      4,400,450 |
| EP-010 | Log Sheet System        | Entry, mobile, print, signatures, approvals, locking, validation |         241.62 |     20,537,700 |
| EP-011 | Work Reporting System   | Ad-hoc reports, signatures, R2 storage, print, status            |          22.75 |      1,933,750 |
| EP-012 | Summary Reports         | Monthly sign-off, attachments, chapters, print                   |          35.50 |      3,017,500 |
| EP-013 | Notification System     | Bell, items, real-time, limit breach detection                   |          27.98 |      2,378,300 |
| EP-014 | Dashboard               | Analytics, charts, metrics, photos, scoped view                  |          30.84 |      2,621,400 |
| EP-015 | Client Portal & Profile | Read-only CLIENT role, avatar upload, portal                     |          27.67 |      2,351,950 |
| EP-016 | Infrastructure          | Shared components, schema, migrations, seed, DevOps, testing     |          97.72 |      8,306,200 |
| EP-017 | Cloudflare Worker       | R2 upload API, CORS, bearer auth                                 |          14.73 |      1,252,050 |
| EP-CG05 | Caching Infrastructure   | Cache tags, DI container, cached services, revalidation        |          35.83 |      3,045,550 |
|        | **TOTAL**               |                                                                  |     **838.43** | **71,266,550** |

---

## Complexity Breakdown

| Complexity         | Epics                                                                          | % of Total |
| :----------------- | :----------------------------------------------------------------------------- | ---------: |
| High (>40 hrs)     | EP-010 (Log Sheets), EP-016 (Infra), EP-004 (Projects), EP-009 (Params)        |      55.2% |
| Medium (20-40 hrs) | EP-002, EP-001, EP-012, EP-014, EP-013, EP-008, EP-015, EP-007, EP-006, EP-011, EP-CG05 |      40.1% |
| Low (<20 hrs)      | EP-005, EP-003, EP-017                                                         |       6.6% |

---

## Contract vs. Actual Value

| Metric                           |           Value |
| :------------------------------- | --------------: |
| Contract Price                   |    Rp 5,000,000 |
| Actual Project Value (Deep Scan) |   Rp 71,266,550 |
| Difference                       | - Rp 66,266,550 |
| Contract as % of Value           |            7.0% |

### Deep Scan vs. Fast Scan Comparison

| Metric      |     Fast Scan |     Deep Scan |          Delta |
| :---------- | ------------: | ------------: | -------------: |
| Total Hours |        496.92 |        838.43 |        +341.51 |
| Total Cost  | Rp 42,238,200 | Rp 71,266,550 | +Rp 29,028,350 |
| Tasks       |          ~170 |           259 |            +89 |
| % Increase  |             — |             — |         +68.7% |

---

## Maintenance Tiers (Monthly)

> **Rate analysis at Rp 85,000/hr:**

| Tier | Name         | Price (IDR/mo) | Max Hours | Labor Cost | Margin | Response SLA | Bug Fix SLA             |
| :--- | :----------- | -------------: | --------: | ---------: | -----: | :----------- | :---------------------- |
| 1    | **Basic**    |        750,000 |     4 hrs |    340,000 |    55% | 48-72 hrs    | Best effort, 5 biz days |
| 2    | **Standard** |      2,500,000 |    20 hrs |  1,700,000 |    32% | <24 hrs      | Minor: 2d, Major: 5d    |
| 3    | **Premium**  |      4,500,000 |    40 hrs |  3,400,000 |    24% | <4 hrs       | Minor: <4h, Major: <48h |

### Tier Details

**Tier 1 — Basic (Rp 750k/mo)**

- Max 4 hours/month
- Email communication only
- Business days only (Mon-Fri)
- Response within 48-72 hours
- Bug fix: best effort, within 5 business days
- No proactive monitoring

**Tier 2 — Standard (Rp 2,500,000/mo)**

- Max 20 hours/month
- Chat + email communication
- Business hours (Mon-Fri, 09:00-17:00 WIB)
- Response within 24 hours
- Bug fix: minor 2 days, major 5 days
- Monthly health check report

**Tier 3 — Premium (Rp 4,500,000/mo)**

- Max 40 hours/month
- Chat + call communication
- Including weekends & holidays
- Response within 4 hours
- Bug fix: minor <4 hours, major <48 hours
- Weekly health check + proactive monitoring
- Priority queue (before Basic/Standard clients)

### Common Terms (All Tiers)

- **New features** = separate contract/addendum
- **Rollover hours:** No
- **Overage rate:** Rp 100,000/hr (Basic/Standard), Rp 125,000/hr (Premium)
- **Contract period:** Minimum 3 months
- **Payment:** Due by 5th of each month

---

> **Detailed task-level breakdown:** See `WBS_DETAILED.md`
> **Scanning checklist:** See `SCANNING_CHECKLIST.md`
