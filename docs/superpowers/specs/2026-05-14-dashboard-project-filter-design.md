# Dashboard Project Filter — Design Specification

> **Date:** 2026-05-14  
> **Status:** Approved  
> **Related:** Dashboard module, AnalyticsDashboard, RecentActivitySection

---

## 1. Problem Statement

The dashboard displays charts (Approach, Ampere) and an activity feed that currently show **aggregated data across all accessible projects**. Users need the ability to filter this data by a **single selected project** to view project-specific metrics and activities.

---

## 2. User Story

> As a [internal user/CLIENT],  
> I want to select a specific project from a dropdown on the dashboard  
> so that I can see charts and activity data scoped to that project only.

---

## 3. Scope

**In Scope:**
- Add project dropdown filter to the AnalyticsDashboard section
- Filter all charts (`ApproachChart`, `AmpereChart`, `RecentPhotosGallery`) by selected project
- Filter `RecentActivitySection` by selected project
- URL-driven state (`?projectId=<uuid>`) for shareability
- Access control: dropdown shows only projects the user can access

**Out of Scope:**
- Multi-project selection (compare multiple projects)
- Persisting preference in user settings
- Dashboard-level summary stats (top cards) remain global

---

## 4. Existing Infrastructure

All required backend support already exists:

| Action | Project filter param | Status |
|--------|----------------------|--------|
| `getDashboardMetricsAction` | `projectId?: string` | ✅ Implemented |
| `getRecentPhotosAction` | `projectId?: string` | ✅ Implemented |
| `getRecentActivitiesAction` | `projectId?: string` | ✅ Implemented |

The `resolveTargetProjectIds` utility (src/features/dashboard/utils.ts:13) validates access and returns the resolved project ID list. All services accept `projectIds: string[] | undefined`.

---

## 5. UI/UX Design

### Placement
- Inside `AnalyticsDashboard` component, top-right alongside the existing `TimeRangeSelector`
- Consistent desktop-first layout (mobile stacks below title if needed)

### Component: `ProjectSelector`

**Props:**
- `value: string | null` — currently selected project ID; null = all
- `userRole: string` — determines project list source

**Behavior:**
- Default: "Semua Proyek" (value = ALL / null)
- Options: Fetched from appropriate project list API
- Loading state: Spinner inside select trigger
- Empty state: Disabled select with "Tidak ada proyek" message
- On change: Updates URL query `?projectId=xxx` (or removes it for "Semua")

**Data sources by role:**
- **Scoped roles** (SUPERVISOR, TECHNICIAN, CLIENT*, use `getDashboardProjectsAction`): only accessible ongoing projects
- **Admin roles** (ADMIN, DIRECTOR, REPORTING, use `getProjectsAction`): all system projects

---

## 6. Data Flow

```
┌─────────────────────────────────────────────────────┐
│ Main Page (server)                                  │
│   - reads searchParams.projectId                    │
│   - passes to AnalyticsDashboard & RecentActivity  │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ AnalyticsDashboard (server)                         │
│   - receives projectId prop                          │
│   - renders ProjectSelector (client)                 │
│   - passes projectId to getDashboardMetricsAction   │
│   - passes projectId to getRecentPhotosAction       │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ ProjectSelector (client)                            │
│   - fetches project list based on user role         │
│   - on change: router.push(?projectId=xxx)          │
└─────────────────────────────────────────────────────┘
```

---

## 7. URL Contract

**Query Parameters:**
- `projectId` — optional string (UUID). When absent, all accessible projects are included.
- `timeRange` — existing param (`7d`, `30d`, `90d`)

**Examples:**
- `/` — all projects, default time range
- `/` — all projects, 30d (default)
- `/?projectId=abc&timeRange=90d` — single project, 90 days

**Backward compatibility:** Existing URLs without `projectId` continue to work (null aggregation).

---

## 8. Type Definitions

No new types required. Uses existing:
- `IGetRecentActivitiesActionInput` already has `projectId?: string`
- Action schemas already include `projectId: z.string().uuid().optional()`

`ProjectSelector` component requires minimal local interface:
```ts
interface IProjectOption { id: string; name: string; }
```

---

## 9. Error Handling & Edge Cases

| Case | Handling |
|------|----------|
| No accessible projects | Select shows empty list + disabled; charts show "Belum ada data" |
| Invalid projectId (tampered URL) | Action returns empty (projectId filtered out by access check) |
| Project deleted after selection | Server returns no data; charts show empty gracefully |
| Concurrent filter changes | URL update triggers re-render; previous request may race but results consistent |
| Network failure fetching projects | Select falls back to empty; user can still view all projects |

---

## 10. Performance Considerations

- Project list fetch: once on mount (client component). Cached by browser/Next.js.
- Metrics & photos: server actions already use appropriate indexes (projectId, date)
- No client-side polling; all data server-rendered with Suspense
- URL changes trigger full RSC revalidation (expected)

---

## 11. Testing Strategy

### Manual QA (Primary)
Given time constraints and rescue mode, manual end-to-end testing is sufficient.

**Test matrix:**
1. Role: ADMIN — all projects visible, selection filters correctly
2. Role: SUPERVISOR — only assigned projects visible
3. Role: CLIENT — client-scoped projects visible
4. Clear filter → returns to aggregated view
5. URL shareability → copy/paste preserves filter

### Automated (Optional, Stretch)
- Unit test `ProjectSelector` state logic (mock fetch)
- Snapshot test for `AnalyticsDashboard` with/without `projectId`

---

## 12. Accessibility

- Select uses native `<button>` + ARIA from shadcn/ui (accessible)
- All options have clear labels (project names)
- Loading state announced via `aria-busy` (implicit through disabled)
- Keyboard navigation (Up/Down, Enter) works out of box

---

## 13. Implementation Checklist

- [x] Create `ProjectSelector` client component
- [x] Fetch project list based on `userRole` with correct action
- [x] URL sync via `router.push` without scroll
- [x] Integrate into `AnalyticsDashboard` (pass `projectId`, fetch `user`)
- [x] Pass `projectId` from main `page.tsx` via `searchParams`
- [x] Confirm `RecentActivitySection` already accepts `projectId`
- [x] Verify all three actions receive `projectId` correctly
- [x] Manual test per matrix above
- [x ]Commit with conventional messages

---

## 14. Alternatives Considered

| Option | Reason Rejected |
|--------|-----------------|
| Client-state only (no URL) | Non-shareable, refresh loses state |
| Multi-select | More UI complexity; single select suffices for MVP |
| Global filter on page (outside card) | Would filter KPI cards too (out of scope); inconsistent scope |

---

*End of specification.*
