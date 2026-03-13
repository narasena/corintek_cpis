# UI/UX Audit Report — CPIS

> **Date:** 2026-03-14  
> **Auditor:** Senior Product Designer & DX Expert  
> **Scope:** All modules across CPIS application  
> **Target Users:** Field technicians using low-budget Android phones, internal staff, clients

---

## Executive Summary

This audit evaluates the CPIS (Corintek Plant Information System) UI/UX across visual consistency, navigation, interactions, accessibility, and performance perception. The application has a solid foundation using Next.js 16, React 19, and shadcn/ui components. However, several critical gaps were identified that directly impact usability—especially for the target mobile-first users (field technicians on Android devices).

**Key Findings:**
- 🔴 **3 Critical (P0)** issues requiring immediate fix
- 🟠 **4 Major (P1)** issues impacting significant user experience  
- 🟡 **5 Minor (P2)** issues for future enhancement
- 🔵 **3 Optional (P3)** nice-to-have improvements

---

## Priority 0 — CRITICAL (Fix Immediately)

### UI-UX-001: Work Reports Page Header Misalignment

**Problem:**  
The header in `src/app/(main)/work-reports/[projectId]/components/work-report-page-client.tsx` has incorrect layout structure:

```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
    <Button asChild variant="outline" size="sm">
      <Link href={`/my-projects/${projectId}`}>Kembali ke Proyek</Link>
    </Button>
    <h1 className="text-2xl font-bold tracking-tight">Laporan Kerja</h1>
  </div>
  <WorkReportCreateDialog ... />
</div>
```

The "Kembali ke Proyek" button and "Laporan Kerja" heading are in the same flex row as the create dialog button. On mobile screens, this causes:
- Horizontal overflow or wrapping that breaks layout
- Button gets squished or hidden
- User cannot easily navigate back

**Why It Matters:**  
- **Mobile-first violation:** Target users are field technicians on Android phones with small screens
- **Primary workflow disruption:** Work Reports is a core feature used daily by technicians
- **Navigation blocker:** Users cannot reliably navigate back to project context

**Proposed Fix:**  
1. Use `flex-wrap` or `flex-col md:flex-row` for responsive layout
2. Separate back button from heading on mobile (use breadcrumb or move to sidebar)
3. Add proper breakpoints: `flex-col gap-3` for mobile, `flex-row items-center` for desktop

---

### UI-UX-002: Incomplete Mobile Navigation Coverage

**Problem:**  
`MobileNav` component (`src/components/mobile-nav.tsx`) only exposes 4 menu items:
- Home
- Projects  
- Log Sheets
- Absensi

Many critical features are **not accessible** on mobile:
- Work Reports (core feature)
- Lab Analyses
- Reports (global log sheet view)
- Users management
- Clients management
- Summary Reports
- Parameters (admin only)

**Why It Matters:**  
- **Mobile-first mandate violated:** AGENTS.md explicitly states "Technicians use low-budget Android phones in field conditions"
- **Workflow discontinuity:** Technicians must switch to desktop to access major features
- **Productivity loss:** Field workers cannot complete full workflow on their primary device
- **Contrast with desktop:** Desktop sidebar has 20+ menu items; mobile has 4

**Proposed Fix:**  
1. Expand MobileNav to include priority menu items (top 8-10 most used)
2. Use expandable "More" menu for secondary features
3. Consider bottom sheet navigation triggered by hamburger menu
4. Prioritize: Work Reports, Lab Analyses, Reports (in addition to existing 4)

---

### UI-UX-003: Accessibility — Focus Management & Color Contrast

**Problem A — Focus Indicators:**  
- Focus states are inconsistent across interactive elements
- No visible `focus-visible` rings on many buttons and inputs
- Keyboard users cannot reliably track which element is active

**Problem B — Color Contrast:**  
- Header gradient (`bg-gradient-to-r from-primary via-primary to-primary/95`) with white text may not meet WCAG 4.5:1 ratio
- Status badges use `bg-gray-100 text-gray-800` — contrast may be insufficient for small text
- Some `text-muted-foreground` on backgrounds fail accessibility checks

**Why It Matters:**  
- **Legal compliance:** WCAG 2.1 Level AA is standard for internal tools
- **Inclusive design:** Some users have visual impairments
- **Keyboard navigation:** Internal staff may prefer keyboard-only operation
- **Professional standards:** Inconsistent accessibility reflects poorly on product quality

**Proposed Fix:**  
1. Add consistent `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` to all interactive elements
2. Audit all color combinations using axe-core or WAVE tool
3. Increase contrast ratios: use darker text on light backgrounds, or lighter backgrounds for dark text
4. Test with screen reader (NVDA/VoiceOver) for proper ARIA labels

---

## Priority 1 — MAJOR (Fix in Next Sprint)

### UI-UX-004: Visual Inconsistency — Typography & Spacing

**Problem:**  
Inconsistent design tokens across modules:

| Element | Projects Page | Work Reports | Log Sheets | Summary Reports |
|---------|-------------|-------------|-----------|----------------|
| Heading Size | `text-3xl` | `text-2xl` | `text-3xl` | `text-2xl` |
| Spacing | `space-y-8` | `space-y-6` | `space-y-8` | `space-y-6` |
| Card Padding | `p-6` | `p-4` | varies | `p-4` |

**Why It Matters:**  
- **User disorientation:** Inconsistent layouts feel like different apps
- **Maintenance burden:** Developers must remember ad-hoc values
- **Professional appearance:** Inconsistency reduces trust in the system

**Proposed Fix:**  
1. Create design tokens in `src/lib/design-tokens.ts`:
   ```ts
   export const spacing = { compact: 'space-y-4', default: 'space-y-6', spacious: 'space-y-8' }
   export const typography = { h1: 'text-3xl', h2: 'text-2xl', h3: 'text-xl' }
   ```
2. Apply consistently across all pages
3. Document in `docs/ DESIGN_SYSTEM.md` (create if needed)

---

### UI-UX-005: Loading States — Inconsistent Skeleton Usage

**Problem:**  
Loading states vary across pages:
- Some use full skeleton with multiple animated elements
- Others use simple single spinner
- Skeleton structures don't match actual content layout

Examples:
- Dashboard: Uses `animate-pulse` with placeholder shapes
- Projects page: Simple spinner in center
- Work Reports: Simple spinner

**Why It Matters:**  
- **Perceived performance:** Skeletons make loading feel faster (progressive disclosure)
- **Professional polish:** Inconsistent loading UX feels unfinished
- **User anxiety:** Users aren't sure if the app is working or stuck

**Proposed Fix:**  
1. Create reusable skeleton components: `SkeletonCard`, `SkeletonTable`, `SkeletonForm`
2. Match skeleton structure to actual content layout
3. Use `loading.tsx` Suspense boundaries for route-level loading
4. Add skeleton to DataTable while fetching initial data

---

### UI-UX-006: Error Handling — Non-Informative Messages

**Problem:**  
Error messages are generic and don't guide users to resolution:

```tsx
// Current examples:
toast.error('Gagal mengambil data proyek')
toast.error('Terjadi kesalahan saat memuat data')
toast.error('Gagal absen masuk', { description: result.error })
```

Issues:
- No specific guidance ("Check your connection", "Try refreshing")
- Technical error details sometimes exposed to users
- No suggested actions

**Why It Matters:**  
- **User frustration:** Users don't know how to recover from errors
- **Support burden:** Generic errors increase support tickets
- **Trust erosion:** Repeated unexplained failures reduce confidence

**Proposed Fix:**  
1. Categorize errors: network, validation, permission, server
2. Create error message templates:
   ```ts
   const ERROR_MESSAGES = {
     network: 'Koneksi internet terputus. Silakan coba lagi.',
     permission: 'Anda tidak memiliki akses ke fitur ini.',
     server: 'Server sibuk. Silakan tunggu sebentar.'
   }
   ```
3. Add retry buttons in toasts for transient errors
4. Log detailed errors server-side; show simplified to users

---

### UI-UX-007: DataTable Performance — No Virtualization

**Problem:**  
DataTable in `Reports` page loads all global log sheets without virtualization:
- Potentially thousands of rows rendered in DOM
- Severe performance degradation on mobile devices
- Scrolling becomes laggy/freezes

**Why It Matters:**  
- **Mobile performance:** Target users on low-end Android experience freezing
- **Scalability blocker:** System cannot grow beyond few thousand records
- **User abandonment:** Slow interfaces cause users to stop using the app

**Proposed Fix:**  
1. Install `@tanstack/react-virtual` for DataTable
2. Implement virtual scrolling for tables >100 rows
3. Add pagination as fallback for datasets that can't be virtualized
4. Test on low-end device emulators (512MB RAM, slow CPU)

---

## Priority 2 — MINOR (Enhance When Time Permits)

### UI-UX-008: Login Page — Mixed Language

**Problem:**  
`src/app/login/components/login-form.tsx` uses mixed English/Indonesian:
- Button: "Sign in" (English)
- Card description: "Enter your email below to login to your account." (English)
- Labels: "Email", "Password" (English - acceptable)
- Success toast: "Login berhasil" (Indonesian - good)

**Why It Matters:**  
- **Inconsistent localization:** Other parts of app use Indonesian; login should too
- **Professional appearance:** Mixed language feels unpolished
- **User confusion:** New users might expect consistent language

**Proposed Fix:**  
Change "Sign in" → "Masuk" and description to Indonesian

---

### UI-UX-009: Parameter Page — Tab Crowding

**Problem:**  
`src/app/(main)/parameters/page.tsx` has 3 tabs with vastly different content:
- "Batas Default" → Parameter limit configuration
- "Profil" → Limit profiles management
- "Parameter" → Master parameter CRUD

First two tabs share domain (limits), third is completely different.

**Why It Matters:**  
- **Information architecture:** Tabs should contain related content
- **User confusion:** Users expect tabs to be variations of same concept
- **Navigation inefficiency:** Users must click through to find what they need

**Proposed Fix:**  
1. Restructure: Combine "Batas Default" and "Profil" into single "Limit Profiles" tab
2. Move "Parameter" to separate page or as sub-section within tab
3. Consider accordion or sidebar for complex admin areas

---

### UI-UX-010: Summary Reports — File Input UX

**Problem:**  
File attachment inputs in `src/app/(main)/summary-reports/page.tsx` use default browser `<Input type="file">`:
- No visual confirmation when file is selected
- No file type/size validation feedback
- No thumbnail preview for images

**Why It Matters:**  
- **User uncertainty:** Did the file actually attach?
- **Error-prone:** Wrong file types accepted without warning
- **Poor UX:** Default file inputs are ugly and inconsistent with rest of UI

**Proposed Fix:**  
1. Create custom file upload component with drag-drop zone
2. Show selected file name with remove button
3. Add file type validation with error message
4. Preview images before upload

---

### UI-UX-011: Attendance — Three Different Views

**Problem:**  
Attendance page has role-specific views with very different UIs:
- Technician: Clock in/out with camera
- Supervisor: View technician attendance table
- PIC: Different table view

Code is duplicated across three components with different layouts.

**Why It Matters:**  
- **Code duplication:** Three similar but different implementations
- **Maintenance burden:** Changes need to be made in multiple places
- **User inconsistency:** Role-switching shows jarring UI changes

**Proposed Fix:**  
1. Create unified attendance table component
2. Add role-based action buttons (clock in/out only for technicians)
2. Use same table structure across all views with conditional columns

---

### UI-UX-012: Dashboard — Welcome Banner Decoration

**Problem:**  
Dashboard welcome banner has decorative icon with low opacity (`opacity-10`) that serves no functional purpose:

```tsx
<div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-10 pointer-events-none">
  <Activity className="w-96 h-96 text-primary" />
</div>
```

**Why It Matters:**  
- **Visual noise:** Distracting without value
- **Performance:** Large hidden element still renders
- **Mobile waste:** Space could be used for useful content

**Proposed Fix:**  
Remove decorative element or replace with meaningful content (quick stats, recent activity preview)

---

## Priority 3 — OPTIONAL (Nice to Have)

### UI-UX-013: Keyboard Shortcuts for Power Users

**Problem:**  
No keyboard shortcuts for common actions (create, save, navigate back).

**Proposed:** Add shortcuts: `Ctrl+N` (new), `Ctrl+S` (save), `Esc` (close dialog/back)

---

### UI-UX-014: Micro-interactions & Animations

**Problem:**  
Transitions between states are abrupt. No micro-interactions for:
- Button hover/active states beyond color change
- Loading to content transition
- Success/error state changes

**Proposed:** Add subtle animations using Framer Motion or CSS transitions for delight factor

---

### UI-UX-015: Dark Mode Consideration

**Problem:**  
Only light mode implemented. No dark mode toggle or system preference detection.

**Proposed:** If client requests, implement dark mode using CSS variables and Tailwind dark: modifier

---

## Implementation Plan

### Phase 1: Critical Fixes (Week 1)

| Task | Issue | Effort | Owner |
|------|-------|--------|-------|
| Fix Work Reports header layout | UI-UX-001 | 2h | - |
| Expand MobileNav coverage | UI-UX-002 | 4h | - |
| Add focus-visible styles globally | UI-UX-003 | 3h | - |
| Audit and fix color contrast | UI-UX-003 | 2h | - |

### Phase 2: Major Improvements (Week 2-3)

| Task | Issue | Effort | Owner |
|------|-------|--------|-------|
| Create design tokens | UI-UX-004 | 4h | - |
| Standardize skeleton components | UI-UX-005 | 3h | - |
| Improve error messages | UI-UX-006 | 3h | - |
| Add DataTable virtualization | UI-UX-007 | 6h | - |

### Phase 3: Enhancements (Week 4+)

| Task | Issue | Effort | Owner |
|------|-------|--------|-------|
| Fix login page language | UI-UX-008 | 1h | - |
| Restructure Parameters tabs | UI-UX-009 | 2h | - |
| Custom file upload component | UI-UX-010 | 4h | - |
| Unify Attendance views | UI-UX-011 | 5h | - |

---

## Related Documentation

- **Mobile-first mandate:** AGENTS.md — "Technicians use low-budget Android phones in field conditions"
- **Current bugs:** docs/bugs.md (48 bugs tracked)
- **Backlog:** docs/BACKLOG.md
- **Project structure:** docs/STRUCTURE.md
- **Context/gotchas:** docs/CONTEXT.md

---

## Audit Metadata

- **Auditor:** AI Senior Product Designer & DX Expert
- **Date:** 2026-03-14
- **Files reviewed:** 25+ page components, 15+ shared components
- **Tool versions:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui
- **Browser targets:** Chrome (desktop), Chrome for Android (mobile testing proxy)
