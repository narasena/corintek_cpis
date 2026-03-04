# WBS Module: M-16 Dashboard (EP-014)

## 1. File Manifest

| File Path | Lines | Functions/Components | Purpose |
| :--- | ---: | ---: | :--- |
| `src/features/dashboard/actions.ts` | 89 | 3 | Server actions for metrics and photos with role-based scoping. |
| `src/features/dashboard/service.ts` | 98 | 2 | Database service using Prisma for analytics and photos fetching. |
| `src/features/dashboard/utils.ts` | 31 | 1 | Utility to resolve project IDs based on actor role and requested ID. |
| `src/features/dashboard/utils.test.ts` | 91 | 5 tests | Vitest unit tests for the project ID resolution logic. |
| `src/app/(main)/page.tsx` | 85 | 1 | Main dashboard page entry point with role switching logic. |
| `src/app/(main)/components/dashboard-scoped.tsx` | 235 | 4 | Scoped dashboard UI for technicians/clients with project cards. |
| `src/app/(main)/_components/ampere-chart.tsx` | 21 | 1 | Wrapper component for Ampere trend chart. |
| `src/app/(main)/_components/analytics-dashboard.tsx` | 74 | 1 | Container for all analytics charts and the photo gallery. |
| `src/app/(main)/_components/approach-chart.tsx` | 26 | 1 | Wrapper component for Approach trend chart. |
| `src/app/(main)/_components/metric-line-chart.tsx` | 85 | 1 | Reusable Recharts line chart component for metrics. |
| `src/app/(main)/_components/recent-photos-gallery.tsx` | 71 | 1 | Component to display a grid of recent log sheet photos. |

## 2. WBS Table (EP-014)

| ID | Parent | Type | Item | O | L | P | E |
| :-- | :----- | :--- | :--- | --: | --: | --: | --: |
| **EP-014** | — | **Epic** | **Analytics & Dashboard** | **—** | **—** | **—** | **Σ** |
| **US-014-001** | EP-014 | **User Story** | **As a user, I want to see a personalized dashboard with relevant metrics and project status** | **—** | **—** | **—** | **Σ** |
| AC-014-001 | US-014-001 | Acceptance Criteria | Role-based dashboard views (Admin vs Scoped) | — | — | — | Σ |
| AC-014-002 | US-014-001 | Acceptance Criteria | Real-time project tracking for technicians and clients | — | — | — | Σ |
| AC-014-003 | US-014-001 | Acceptance Criteria | Historical performance trends for Ampere and Approach metrics | — | — | — | Σ |
| **WP-014-001** | US-014-001 | **Work Package** | **Frontend (Dashboard UI)** | **—** | **—** | **—** | **Σ** |
| TK-014-001 | WP-014-001 | Task | MetricLineChart: Generic Recharts integration (responsive, tooltip, legend) | 2 | 3 | 5 | 3.17 |
| TK-014-002 | WP-014-001 | Task | AmpereChart & ApproachChart: Parameter-specific chart specializations | 1 | 1.5 | 3 | 1.67 |
| TK-014-003 | WP-014-001 | Task | RecentPhotosGallery: Grid view with metadata overlays and image optimization | 1.5 | 3 | 5 | 3.08 |
| TK-014-004 | WP-014-001 | Task | DashboardScoped: Interactive view with real-time polling and project cards | 3 | 5 | 8 | 5.17 |
| TK-014-005 | WP-014-001 | Task | AnalyticsDashboard: Main container for trend and photo components | 1 | 2 | 4 | 2.17 |
| TK-014-006 | WP-014-001 | Task | Dashboard Main Page: Role-based switching logic and landing UI | 1 | 2 | 3 | 2.00 |
| **WP-014-002** | US-014-001 | **Work Package** | **Backend (Dashboard & Analytics Logic)** | **—** | **—** | **—** | **Σ** |
| TK-014-007 | WP-014-002 | Task | getDashboardMetrics: Data aggregation, date grouping, and averaging logic | 2 | 4 | 7 | 4.17 |
| TK-014-008 | WP-014-002 | Task | resolveTargetProjectIds: Role-based project scoping security logic | 1.5 | 3 | 5 | 3.08 |
| TK-014-009 | WP-014-002 | Task | Dashboard Server Actions (Metrics, Photos) with Zod validation | 1 | 2 | 4 | 2.17 |
| TK-014-010 | WP-014-002 | Task | getRecentLogSheetPhotos: Optimized query for latest documentation assets | 0.5 | 1 | 2 | 1.08 |
| **WP-014-003** | US-014-001 | **Work Package** | **Testing & Validation** | **—** | **—** | **—** | **Σ** |
| TK-014-011 | WP-014-003 | Task | Unit tests for project scoping utility (utils.test.ts) | 1 | 2 | 3 | 2.00 |

## 3. Confidence Assessment
- **Confidence Score:** 95% [🟢]
- **Notes:** All relevant files were read in full. The complexity of the `DashboardScoped` component was significantly higher than estimated in the fast scan due to real-time features and complex card logic.
