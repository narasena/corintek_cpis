# Dashboard Project Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add project dropdown filter to dashboard so users can view charts and activity data scoped to a specific project.

**Architecture:** URL query parameter-driven filtering. The `projectId` query param flows from page → AnalyticsDashboard → server actions. A new ProjectSelector client component manages the dropdown UI and router navigation.

**Tech Stack:** Next.js 16 App Router, React Server Components, shadcn/ui Select, URLSearchParams, server actions

---

## File Structure & Responsibility Map

```
src/app/(main)/page.tsx                         # Server page - reads searchParams.projectId, passes down
src/app/(main)/_components/analytics-dashboard.tsx  # Server component - accepts projectId, renders ProjectSelector
src/app/(main)/_components/project-selector.tsx      # NEW client component - dropdown + URL sync
src/app/(main)/_components/recent-activity-section.tsx  # Already accepts projectId (no change needed)
```

---

## Task 1: Project Selector Client Component

**Files:**
- Create: `src/app/(main)/_components/project-selector.tsx`

**Step 1.1: Write the component skeleton with shadcn Select**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface IProjectOption {
  id: string;
  name: string;
}

interface IProps {
  /** Currently selected project ID (null = all projects) */
  value: string | null;
  /** User role to determine accessible projects */
  userRole: string;
}

export function ProjectSelector({ value, userRole }: IProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<IProjectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        // Fetch all accessible projects for this user
        const res = await fetch(`/api/dashboard/projects?${params.toString()}`);
        // This is placeholder - real implementation will use an action
        setProjects([]);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userRole]);

  const handleChange = (projectId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (projectId === 'ALL') {
      params.delete('projectId');
    } else {
      params.set('projectId', projectId);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Select
      value={value ?? 'ALL'}
      onValueChange={handleChange}
      disabled={loading}
    >
      <SelectTrigger className="w-[240px]">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SelectValue placeholder="Pilih Proyek" />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">Semua Proyek</SelectItem>
        {projects.map(p => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

**Step 1.2: Determine data source for projects list**
- ADMIN/DIRECTOR/REPORTING roles: use `getProjectsAction` (all system projects)
- Scoped roles (SUPERVISOR/TECHNICIAN/CLIENT*): use `getDashboardProjectsAction` (accessible only)
- This needs to be passed as prop or fetched inside component; decide based on pattern consistency with TimeRangeSelector

**Decision:** Fetch inside component based on role (like a typical client component). Implement helper to get correct action.

**Step 1.3: Implement project fetching using proper actions**

```tsx
// At top of file
import { getDashboardProjectsAction, getProjectsAction } from '@/features/projects/actions';

// Inside useEffect
const isScoped = ['SUPERVISOR', 'TECHNICIAN', 'CLIENT', 'CLIENT_SUPERVISOR', 'CLIENT_TECHNICIAN'].includes(userRole as any);
const res = isScoped 
  ? await getDashboardProjectsAction({})
  : await getProjectsAction({});

if (res.success && res.data) {
  const data = res.data as any;
  setProjects(
    data.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name }))
  );
}
```

**Step 1.4: Add proper error handling and empty state**

If projects list empty, render disabled Select with message "Tidak ada proyek".

**Step 1.5: Write file and commit**

Create `src/app/(main)/_components/project-selector.tsx` with all the above. Commit as `feat(dashboard): add project selector component`.

---

## Task 2: Integrate ProjectSelector into AnalyticsDashboard

**Files:**
- Modify: `src/app/(main)/_components/analytics-dashboard.tsx`

**Step 2.1: Update props to accept projectId**

Change signature from:
```tsx
export async function AnalyticsDashboard({ timeRange = '30d' }: { timeRange?: '7d' | '30d' | '90d' })
```
To:
```tsx
export async function AnalyticsDashboard({
  timeRange = '30d',
  projectId = null,
}: {
  timeRange?: '7d' | '30d' | '90d';
  projectId?: string | null;
})
```

**Step 2.2: Import ProjectSelector component**

```tsx
import { ProjectSelector } from './project-selector';
import { getCurrentUserDetails } from '@/features/auth/lib/user-context';
```

**Step 2.3: Fetch current user for ProjectSelector**

```tsx
const user = await getCurrentUserDetails();
if (!user) {
  // Should not happen - handled by middleware, fallback to unauthenticated UI
  return <div>Silakan login</div>;
}
```

**Step 2.4: Render ProjectSelector alongside TimeRangeSelector**

Update the header section:
```tsx
<div className="flex items-center justify-between">
  <div className="flex flex-col gap-1">
    <h2 className="text-lg font-semibold tracking-tight">Analitik</h2>
    <p className="text-sm text-muted-foreground">
      Pantau metrik performa unit pendingin
    </p>
  </div>
  <div className="flex items-center gap-4">
    <ProjectSelector value={projectId} userRole={user.role} />
    <TimeRangeSelector defaultValue={timeRange} />
  </div>
</div>
```

**Step 2.5: Pass projectId to action calls**

Change from:
```tsx
const [metricsRes, photosRes] = await Promise.all([
  getDashboardMetricsAction({ timeRange }),
  getRecentPhotosAction({ limit: 12 }),
]);
```
To:
```tsx
const [metricsRes, photosRes] = await Promise.all([
  getDashboardMetricsAction({ projectId, timeRange }),
  getRecentPhotosAction({ projectId, limit: 12 }),
]);
```

**Step 2.6: Update imports if necessary**

`getDashboardMetricsAction` already supports `projectId`. No change needed to types.

**Step 2.7: Commit changes**

```bash
git add src/app/(main)/_components/analytics-dashboard.tsx
git commit -m "feat(dashboard): integrate project selector into analytics dashboard"
```

---

## Task 3: Wire projectId from Main Page

**Files:**
- Modify: `src/app/(main)/page.tsx`

**Step 3.1: Extract projectId from searchParams**

Add to Page component:
```tsx
export default async function Page(props: {
  searchParams: Promise<{ timeRange?: string; projectId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const timeRange = (searchParams.timeRange as any) || '30d';
  const projectId = searchParams.projectId || null;
  // ... rest
```

**Step 3.2: Pass projectId to AnalyticsDashboard**

For scoped roles:
```tsx
<AnalyticsDashboard timeRange={timeRange} projectId={projectId} />
```
For admin/director:
```tsx
<AnalyticsDashboard timeRange={timeRange} projectId={projectId} />
```

**Step 3.3: Pass projectId to RecentActivitySection**

The RecentActivitySection already accepts optional `projectId` prop. Update both render points:

Scoped section:
```tsx
<RecentActivitySection projectId={projectId} />
```
Admin section:
```tsx
<RecentActivitySection projectId={projectId} />
```

**Step 3.4: Commit**

```bash
git add src/app/(main)/page.tsx
git commit -m "feat(dashboard): wire projectId from URL to dashboard components"
```

---

## Task 4: Adjust TimeRangeSelector styling to accommodate new layout

**Files:**
- Modify: `src/app/(main)/_components/time-range-selector.tsx` (optional)

**Step 4.1: Check if TimeRangeSelector width fits alongside ProjectSelector**

Current width: `w-[240px]`. The ProjectSelector will also be `w-[240px]`. Combined with gap-4, fits in flex container.

**Action:** No change needed unless there's overflow. Keep as-is.

---

## Task 5: Verify RecentActivitySection already supports projectId

**Files:**
- Read: `src/app/(main)/_components/recent-activity-section.tsx`
- Read: `src/app/(main)/_components/recent-activity-client.tsx`

**Step 5.1: Confirm recent-activity-section passes projectId to RecentActivityClient**

Already confirmed: `RecentActivitySection` takes `projectId?` and passes to `RecentActivityClient`.

**Step 5.2: Confirm RecentActivityClient uses projectId correctly**

Check `recent-activity-client.tsx` implementation to ensure it passes `projectId` to hook/action.

---

## Task 6: Test the implementation

**Step 6.1: Start dev server**

```bash
npm run dev
```

**Step 6.2: Manual test cases**

1. Navigate to `/` (dashboard)
   - Verify: Project selector appears next to time range
   - Verify: Loading spinner shows briefly then "Semua Proyek" selected
   - Verify: Charts display aggregated data from all accessible projects

2. Select a specific project from dropdown
   - Verify: URL updates to `?projectId=xxx`
   - Verify: Charts refresh to show only that project's data
   - Verify: Activity feed also filters to that project

3. Change time range while project filtered
   - Verify: Both filters work together (`?projectId=xxx&timeRange=90d`)

4. Click "Semua Proyek" option
   - Verify: `projectId` removed from URL
   - Verify: All project data returns

5. Copy URL with projectId and open in new tab
   - Verify: Dashboard loads with that project pre-selected

**Step 6.3: Role-based access test**

1. Login as ADMIN (can see all projects)
   - Verify: Dropdown lists all system projects

2. Login as SUPERVISOR (scoped)
   - Verify: Dropdown lists only assigned projects

**Step 6.4: Edge case: project with no data**

Select a project with no log sheets in date range.
- Verify: Charts show "Belum ada data" message gracefully

---

## Task 7: Edge case handling

**Potential issues:**

1. **User role changes mid-session** (unlikely) — component re-fetches on mount only; acceptable
2. **Project deleted while selected** — server action returns empty, UI shows no-data state
3. **No accessible projects** — Select shows disabled with "Tidak ada proyek" message
4. **Slow network** — loading spinner in Select trigger

None require additional code if actions already handle empty arrays (they do).

---

## Task 8: Documentation & Cleanup

**Step 8.1: Add component to barrel export (optional)**

If we want to export ProjectSelector for reuse:
```tsx
// In app/(main)/_components/index.ts (if exists)
export { ProjectSelector } from './project-selector';
```

Check if barrel file exists. If not, skip.

**Step 8.2: Update SYSTEM_MAP.md if needed**

Check if dashboard section references need updating. Likely not required.

**Step 8.3: Git commit checklist**

Ensure all changes are committed. No uncommitted files.

---

## Task 9: Optional — Add test coverage

Given the project's existing test patterns, consider adding:

1. Unit test for `ProjectSelector` client component (mock actions, test state transitions)
2. Integration test: render `AnalyticsDashboard` with `projectId` and verify action call includes it

But given the "Speed > Perfection" rescue mode priority, we can skip if time-constrained.

---

## Implementation Order

Execute in this exact order:

1. Task 1 (ProjectSelector component)
2. Task 2 (AnalyticsDashboard integration)
3. Task 3 (Page wiring)
4. Task 5 (Confirm RecentActivityClient behavior)
5. Task 6 (Manual testing)
6. Task 7 (Edge case check)
7. Task 8 (Documentation)

---

## Rollback Plan

If issues arise:
- Revert commits in reverse order
- Remove `projectId` prop from AnalyticsDashboard
- Drop ProjectSelector component file

---

## Acceptance Criteria

- [ ] Project dropdown appears on dashboard next to time range
- [ ] Dropdown lists accessible projects only
- [ ] Selecting a project filters all charts and activity feed
- [ ] URL updates with `?projectId=xxx`
- [ ] "Semua Proyek" clears filter
- [ ] Filters work together (project + timeRange)
- [ ] No console errors
- [ ] Loading state shows spinner
- [ ] Empty state handled gracefully

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-14-dashboard-project-filter.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
