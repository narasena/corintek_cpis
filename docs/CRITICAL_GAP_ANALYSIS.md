# CPIS — Critical Gap Analysis

> **Project:** Corintek Project Information System (CPIS)
> **Prepared by:** Critical Gap Analysis
> **Date:** 2026-03-05
> **Context:** Contract Rp 5M vs Actual Value Rp 68M (7.3%). Project is months behind schedule. ~40 internal users + CLIENT role.
> **Mode:** Rescue Mode — Speed > Perfection | Functionality > Abstraction

---

## Executive Summary

This document identifies implicit/infrastructure features that **should exist** for a production internal tool but were not explicitly listed in feature specifications, WBS, or roadmap. Analysis prioritized by impact-to-effort ratio under rescue-mode constraints.

**Key Findings:**
- **4 Critical gaps** affecting daily usability
- **5 Operational gaps** preventing future pain
- **5 Deferred gaps** (nice-to-have, not worth rescue-mode time)
- **6 Skipped gaps** (overkill for current scope)

---

## TIER 1: MUST IMPLEMENT

> High user impact, directly affects usability. Implement before next delivery.

| # | Gap | Current State | Impact | Effort |
|:--|:----|:-------------|:-------|:-------|
| 1 | **DataTable Search/Filter (global text search)** | DataTable has sorting + client-side pagination only. **Zero filtering/search capability.** Users managing Clients, Users, Projects, Chemicals, Parameters, Attendance, Work Reports all have NO way to find specific records except scrolling. | **CRITICAL** — With growing data, tables become unusable | **Low** — Add `getFilteredRowModel()` + a search `<Input>` to DataTable. ~2-4 hrs |
| 2 | **Server-Side Pagination** | ALL list queries use `findMany()` without `take`/`skip` (except Dashboard & Notifications). Clients, Users, Projects, Chemicals, Parameters, Log Sheets, Work Reports, Lab Analyses — all load **entire datasets into memory**. | **HIGH** — Will degrade as data grows. 40 users generating daily log sheets = thousands of records within months | **Medium** — Requires service + action + type changes per domain. ~8-12 hrs total |
| 3 | **loading.tsx / error.tsx Boundaries** | **ZERO** `loading.tsx` or `error.tsx` files anywhere in the app. No route-level Suspense boundaries, no error recovery UI. Users see blank screens during server-fetches and unhandled crashes. | **HIGH** — Terrible UX, no error recovery | **Low** — Create 2-3 shared loading/error components. ~2-3 hrs |
| 4 | **Column-Level Filters on DataTable** | No per-column filtering (e.g., filter Projects by Status, Users by Role, Attendance by Date). Admin reviewing attendance already has date filters, but other pages have nothing. | **MEDIUM-HIGH** — Standard expectation for internal tools | **Low-Medium** — Add `getFilteredRowModel()` + column filter UI. ~4-6 hrs |

---

## TIER 2: SHOULD IMPLEMENT

> Operational quality, prevents future pain. Implement in next stabilization phase.

| # | Gap | Current State | Impact | Effort |
|:--|:----|:-------------|:-------|:-------|
| 5 | **Data Caching (Next.js)** | No `unstable_cache`, no `cacheTag`, no `revalidateTag` anywhere. Every page load hits the database fresh. Server Actions do `revalidatePath` but there's no caching layer to revalidate against. | **MEDIUM** — Acceptable at 40 users but wasteful; matters when client portal scales | **Medium** — Add `unstable_cache` to read-heavy services (dashboard, parameters, clients). ~4-6 hrs |
| 6 | **Debounced Search Input** | No debounce anywhere in the app. When search is added, it needs debouncing to prevent excessive re-renders. | **MEDIUM** — Directly coupled to Gap #1 | **Low** — ~1 hr, add a `useDebouncedValue` hook |
| 7 | **Empty State Components** | Tables show "Belum ada data." as plain text. No illustrations, no call-to-action buttons ("Tambah [entity] pertama"). | **LOW-MEDIUM** — Polish, but affects first-time UX significantly | **Low** — ~2 hrs for a reusable EmptyState component |
| 8 | **Bulk Actions on DataTable** | No row selection, no bulk delete/export/status-change. Admin managing 40+ users or hundreds of log sheets has no batch operations. | **MEDIUM** — Standard for internal tools | **Medium** — TanStack Table supports it natively. ~4-6 hrs |
| 9 | **URL-Based Filter State (searchParams)** | No filters are persisted in URL. Users can't bookmark filtered views or share links to specific filtered states. | **MEDIUM** — Standard expectation, enables deep linking | **Low** — Use `useSearchParams` + `nuqs` pattern. ~3-4 hrs |

---

## TIER 3: DEFER

> Nice-to-have but not worth rescue-mode time. Defer to maintenance contract.

| # | Gap | Current State | Rationale for Deferring |
|:--|:----|:-------------|:----------------------|
| 10 | **Audit Log / Activity Trail** | No audit log table. Dashboard activity feed is query-time aggregation, not a real audit trail. | 40 users, low-risk domain. RBAC covers access control. Add post-launch if client demands it. |
| 11 | **Rate Limiting on Server Actions** | None. No throttling on login, file uploads, or mutations. | 40 internal users behind auth. Risk is extremely low. Add only if exposed externally. |
| 12 | **Real-time Updates (WebSocket/SSE)** | Dashboard uses polling (60s for notifications). No real-time push. | Polling is fine for 40 users. WebSocket infra is disproportionate effort. |
| 13 | **Data Export (Excel .xlsx)** | CSV only for Attendance. No export for other domains. | CSV covers the need. xlsx requires a new library (`exceljs`). Defer to maintenance phase. |
| 14 | **Advanced Date Range Filters** | Only Attendance admin has date filters. Other list pages have none. | Covered partially by Gap #4 (column filters). Can add incrementally per page. |
| 15 | **Optimistic UI Updates** | Mutations wait for server round-trip before UI reflects changes. | Acceptable for internal tool. Adds complexity for marginal UX gain. |
| 16 | **Global Command Palette (Cmd+K)** | No global search / quick navigation. | Nice-to-have. 40 users with sidebar nav is sufficient. |

---

## TIER 4: SKIP ENTIRELY

> Overkill for current scope and user base.

| # | Gap | Rationale |
|:--|:----|:-----------|
| 17 | **Full-text Search (Elasticsearch/Meilisearch)** | Overkill. Prisma `contains` is sufficient for 40 users + modest data volume. |
| 18 | **CDN / Image Optimization Pipeline** | R2 serves directly. Next.js `<Image>` + WebP compression already handled client-side. |
| 19 | **Internationalization (i18n)** | Single-language app (Indonesian). No multi-tenant needs. |
| 20 | **PWA / Offline Mode** | Technicians have connectivity (they upload photos). Offline-first adds massive complexity. |
| 21 | **Automated Backups / DB Snapshots** | Hosting provider responsibility, not app-level concern. |
| 22 | **API Versioning** | No public API. Server Actions only. |

---

## Recommended Action Plan (Rescue Mode)

### Phase 1 — Immediate (before next delivery, ~6-10 hrs)

1. Add global search input to `DataTable` component (Gap #1)
2. Create shared `loading.tsx` and `error.tsx` boundaries (Gap #3)
3. Add `useDebouncedValue` hook (Gap #6)

### Phase 2 — Next Sprint (~8-12 hrs)

4. Server-side pagination for heaviest tables: Log Sheets, Attendance, Work Reports (Gap #2)
5. Column filters for Status/Role/Date on key pages (Gap #4)

### Phase 3 — Stabilization (post-delivery maintenance)

6. Next.js caching layer (Gap #5)
7. URL-persisted filter state (Gap #9)
8. Empty state components (Gap #7)

### Deferred/Skipped

- Everything in **Tier 3** → Defer to maintenance contract
- Everything in **Tier 4** → Skip entirely

---

## Quick Wins Summary

The biggest bang-for-buck is **Gap #1 (DataTable search)** and **Gap #3 (loading/error boundaries)** — both are low effort but transform the app from "prototype feel" to "production internal tool."

| Quick Win | Feature | Hours | Why |
|:----------|:--------|:-----|:----|
| Search | DataTable global search input | 2-4 | Users can find records without scrolling |
| Loading | Route-level loading.tsx | 1-2 | No more blank screens during fetch |
| Error | Route-level error.tsx | 1-2 | Graceful error recovery UX |
| Debounce | useDebouncedValue hook | 1 | Prevents excessive re-renders |

**Total for all quick wins: ~6-9 hours**

---

## Related Documents

- **Project Status:** `docs/ROADMAP.md`
- **Task Breakdown:** `docs/wbs/WBS_DETAILED.md`
- **Architecture:** `docs/STRUCTURE.md`
- **Key Decisions:** `docs/DECISIONS.md`

---

## Delivery Decision Addendum (2026-03-07)

Post-review decision for rescue mode:

1. CPIS is considered **feature-complete enough to ship** for current scope.
2. Priority shifts from net-new feature building to **stabilization + handover readiness evidence**.
3. Remaining optional enhancements in Tier 2/3 stay in backlog and are handled only under maintenance/addendum scope.
4. Current execution focus:
   - Operational docs with real records (incident/release/rollback/access/change)
   - Release verification evidence (`npm run lint`, `npm run test:run`, `npm run build`, smoke checks)
   - Scope discipline to prevent perfection-driven expansion during handover
