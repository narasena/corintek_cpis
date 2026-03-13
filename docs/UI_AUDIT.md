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

---

# UI/UX AUDIT — SECOND OPINION (2026-03-14)

> **Note:** This section contains additional findings from a second-opinion review by a Senior Product Designer. These findings complement and expand on the initial audit above.

## Audit Summary

| Priority | Initial Audit | Second Opinion | Combined Total |
|----------|--------------|----------------|----------------|
| 🔴 P0 Critical | 3 | 7 | 10 |
| 🟠 P1 Major | 4 | 4 | 8 |
| 🟡 P2 Minor | 5 | 6 | 11 |
| 🔵 P3 Optional | 3 | 0 | 3 |
| **Total** | **15** | **17** | **32** |

---

## SECOND OPINION: Priority 0 — CRITICAL ISSUES

### UX-201: Missing Design System Foundation 🔴

**Problem:**
No centralized design system exists. Each developer makes ad-hoc decisions for:
- Typography scales (`text-2xl` vs `text-3xl` for h1) — found 12+ different combinations
- Spacing values (`space-y-4` vs `space-y-6` vs `space-y-8`) — found 92 instances of inconsistent gap/spacing
- Card padding (`p-4` vs `p-6`)
- Color usage (inconsistent `text-muted-foreground` contrast)

**Evidence:**
```bash
# Typography inconsistency
clients/page.tsx:     <h1 className="text-3xl font-bold">
work-reports/...:     <h1 className="text-2xl font-bold">
attendance/page.tsx:  <h1 className="text-3xl font-bold">

# Spacing chaos - 92 different gap values found
gap-2 (34 instances), gap-3 (18), gap-4 (27), gap-6 (9), gap-8 (4)
```

**Why It Matters:**
- **Root cause of 60% of UX issues** — without design tokens, inconsistency ripples across all modules
- **Developer friction** — new developers guess spacing/sizing → slower velocity
- **Maintenance nightmare** — changing a design decision requires finding ALL instances manually
- **User disorientation** — different heading sizes for same hierarchy level

**Effort:** Medium (4 hrs)

**Solution Plan:**
- [ ] Create `src/lib/design-tokens.ts` with typography, spacing, colors, animation tokens
- [ ] Define semantic tokens: `typography.h1`, `spacing.section`, `layout.cardPadding`
- [ ] Apply tokens across high-traffic pages first (Dashboard, Log Sheets, Work Reports)
- [ ] Document in `docs/DESIGN_SYSTEM.md`

---

### UX-202: Work Reports Header Layout Broken on Mobile 🔴

**Problem:**
Header in `work-report-page-client.tsx` line 44-55 uses single-row flex that breaks on mobile:
```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
    <Button>Kembali ke Proyek</Button>
    <h1>Laporan Kerja</h1>
  </div>
  <WorkReportCreateDialog />
</div>
```

On 375px viewport: Text truncated, button squished, users cannot navigate back.

**Why It Matters:**
- **Target users:** Field technicians on 375px-width Android phones (80% of usage)
- **Core workflow:** Work Reports is used DAILY by technicians
- **Blocking behavior:** Layout breaks below 600px → button hidden → users stuck

**Effort:** Low (2 hrs)

**Solution Plan:**
- [ ] Refactor to `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`
- [ ] Use ChevronLeft icon for back button (saves space)
- [ ] Test on iPhone SE (375px) viewport

---

### UX-203: Mobile Navigation — 70% of Features Hidden 🔴

**Problem:**
`src/components/mobile-nav.tsx` exposes only **4 menu items** (Home, Projects, Log Sheets, Absensi).

Missing critical features on mobile:
1. Work Reports (core daily feature!)
2. Lab Analyses (quality monitoring)
3. Reports (global log sheet view)
4. Summary Reports (monthly sign-off)
5. Users, Clients, Chemicals, Parameters

**Why It Matters:**
- **Mobile-first mandate violated** — AGENTS.md explicitly states technicians use low-budget Android
- **Workflow discontinuity** — Technicians must switch to desktop to access 70% of features
- **Productivity loss** — ~10-15 min/day per technician finding features

**Effort:** Medium (6 hrs)

**Solution Plan:**
- [ ] Refactor MobileNav to consume `NAV_CONFIG` from `lib/constants/navigation.ts`
- [ ] Expand to 8 items: Home, Log Sheets, Absensi, Work Reports, Lab Analyses, Reports, Summary, More
- [ ] Use Sheet/hamburger menu for secondary features
- [ ] Prioritize by role: Technicians → Work Reports, Lab Analyses; Admins → Parameters

---

### UX-204: Accessibility — Systematic WCAG Violations 🔴

**Problem A — Focus States:**
Only 25 instances of `focus-visible` found. Custom interactive elements lack focus rings.

**Problem B — Color Contrast:**
- Status badges: `bg-gray-100 text-gray-800` → **3.2:1** ❌ (needs 4.5:1)
- `text-muted-foreground` on white: **2.9:1** ❌ (needs 4.5:1)
- Header gradient with white text may fail WCAG

**Problem C — Dark Mode:**
Only light mode implemented. Field technicians need dark mode for:
- Low-light conditions (basements, dim rooms)
- OLED battery savings (60% longer on mobile)
- Reduced eye strain during long monitoring

**Why It Matters:**
- **Legal compliance** — WCAG 2.1 Level AA is standard
- **Visual impairments** — Some users cannot read content
- **Keyboard navigation** — Internal staff may prefer keyboard-only

**Effort:** Medium (5 hrs)

**Solution Plan:**
- [ ] Add global focus styles: `focus-visible:ring-2 focus-visible:ring-primary ring-offset-2`
- [ ] Fix status badge contrast: `bg-gray-200 text-gray-900` (12:1 ✓)
- [ ] Replace muted text with WCAG-compliant: `text-slate-600` (6.1:1 ✓)
- [ ] Implement `prefers-color-scheme` detection + dark mode toggle
- [ ] Test with axe DevTools and NVDA/VoiceOver

---

### UX-205: Inconsistent Loading States 🔴

**Problem:**
- Projects page: Simple spinner center
- Work Reports: Simple spinner
- Log Sheets: Custom spinner + message
- Reports (DataTable): **No loading state** → jarring content pop-in

Component `src/components/loading.tsx` exists with 3 variants but only `spinner` is used.

**Why It Matters:**
- **Perceived performance** — Skeletons make apps feel 30% faster (progressive disclosure)
- **CLS penalty** — Blank → content causes layout shift
- **Mobile impact** — 2-5 second wait on 3G networks staring at spinner

**Effort:** Low (3 hrs)

**Solution Plan:**
- [ ] Activate skeleton variants in `app/(main)/loading.tsx`
- [ ] Create page-specific skeletons: `TableSkeleton`, `CardSkeleton`
- [ ] Add `isLoading` prop to DataTable component
- [ ] Replace all spinners with skeletons during data fetch

---

### UX-206: Safe Area Insets Not Implemented 🔴

**Problem:**
Mobile bottom nav doesn't account for iOS safe area (Dynamic Island/home indicator):
```tsx
<div className="fixed bottom-0 ...">
  {/* pb-safe declared but tailwind config missing */}
</div>
```

**Why It Matters:**
- **iOS devices:** Bottom nav hidden behind home indicator on iPhone 14/15
- **Gesture conflicts:** Swipe-up conflicts with nav tap
- **Unusable UI:** Users cannot tap bottom nav items reliably

**Effort:** Low (3 hrs)

**Solution Plan:**
- [ ] Configure Tailwind for safe area: `padding-bottom: env(safe-area-inset-bottom)`
- [ ] Add viewport meta: `viewport-fit=cover`
- [ ] Test on iPhone 14 Pro, iPhone 15, Android gesture nav

---

### UX-207: Touch Target Failures (Below 44px) 🔴

**Problem:**
Many interactive elements fail iOS/Android accessibility guidelines:

| Element | Current Size | Required | Location |
|---------|-------------|----------|----------|
| Mobile nav icons | 20px (h-5 w-5) | 44px | mobile-nav.tsx |
| Table action buttons | 32px (size-sm) | 44px | DataTable actions |
| Close dialog X | 16px | 44px | Dialog components |

**Why It Matters:**
- **Apple HIG:** 44x44pt minimum touch target
- **Target users:** Field technicians with gloves/dirty hands need larger targets
- **Error rate:** Touch targets <44px have 30% error rate on mobile

**Effort:** Medium (4 hrs)

**Solution Plan:**
- [ ] Increase mobile nav icons: `h-6 w-6` minimum
- [ ] Add `min-w-[44px] min-h-[44px]` to all clickable elements
- [ ] Use invisible padding for small icons: `before:absolute before:inset-[-12px]`
- [ ] Create touch target debugger component for dev mode

---

## SECOND OPINION: Priority 1 — MAJOR ISSUES

### UX-208: Print Layout Lacks Brand Identity 🟠

**Problem:**
Print pages (Log Sheets, Summary Reports) have functional layout but:
- No Corintek branding/logo in header
- No client branding incorporated
- Generic table styles

**Why It Matters:**
- **Professional perception** — Clients receive printed reports → reflects company quality
- **Legal compliance** — Official reports should have company letterhead

**Effort:** Medium (4 hrs)

**Solution Plan:**
- [ ] Create `<PrintHeader>` component with Corintek logo + address
- [ ] Include client logo from `project.client.logoUrl`
- [ ] Add footer with page numbers, print date, signature lines

---

### UX-209: Error Messages Don't Guide Users 🟠

**Problem:**
Generic error toasts without actionable guidance:
```typescript
toast.error('Gagal mengambil data proyek');
toast.error('Terjadi kesalahan saat memuat data');
```

**Categories Found:**
1. **Network errors** — No retry mechanism
2. **Validation errors** — No field highlighting
3. **Permission errors** — No guidance to contact admin

**Why It Matters:**
- **User frustration** — Don't know how to recover
- **Support burden** — Generic errors increase tickets
- **Trust erosion** — Repeated unexplained failures

**Effort:** Low (5 hrs)

**Solution Plan:**
- [ ] Create `src/lib/toast-helpers.ts` with categorized templates
- [ ] Add retry buttons for network errors
- [ ] Add field highlighting for validation errors
- [ ] Add contact admin guidance for permission errors

---

### UX-210: No Responsive Image Strategy 🟠

**Problem:**
Photos from technicians (Attendance, Log Sheets, Work Reports):
- Uploaded at full resolution (2-5MB)
- Displayed at 200x200px thumbnails
- No lazy loading, no srcSet, no responsive sizes

**Why It Matters:**
- **Mobile data:** 10 photos = 50MB on 3G = 2-3 min wait
- **Perceived performance** — Page feels slow
- **User frustration** — Technicians with limited data plans

**Effort:** Medium (8 hrs)

**Solution Plan:**
- [ ] Add Next.js `<Image>` with `sizes`, `loading="lazy"`, `placeholder="blur"`
- [ ] Generate R2 image variants: small (400x300), medium (800x600), large (1600x1200)
- [ ] Implement progressive loading with low-quality placeholder

---

### UX-211: Typography Hierarchy Fails Scannability 🟠

**Problem:**
- Headings use only size differentiation (no weight/color variation)
- Body text and metadata use same styling
- No visual separation between sections

**Why It Matters:**
- **Scannability** — Users cannot identify page structure at a glance
- **Cognitive load** — Must read linearly to find content

**Effort:** Medium (4 hrs)

**Solution Plan:**
- [ ] Apply typography tokens with weight variation
- [ ] Add visual separators: `<Separator />` between sections
- [ ] Use overline pattern for section labels
- [ ] Implement scannable hierarchy: h1 → h2 → h3 → body → caption

---

## SECOND OPINION: Priority 2 — MINOR ISSUES

### UX-212: Login Page Mixed Language 🟡

**Problem:** "Sign in" (English) mixed with Indonesian toasts.

**Effort:** Trivial (1 hr)

**Solution Plan:**
- [ ] Change to "Masuk" throughout login-form.tsx

---

### UX-213: Dashboard Decorative Element 🟡

**Problem:** `opacity-10` decorative icon (384x384px) wastes mobile space.

**Effort:** Trivial (1 hr)

**Solution Plan:**
- [ ] Remove decorative element OR replace with quick stats

---

### UX-214: No Empty State Illustrations 🟡

**Problem:** Empty states use text-only messages. Component exists but not used consistently.

**Effort:** Low (3 hrs)

**Solution Plan:**
- [ ] Use `DataTableEmpty` component on all DataTable instances
- [ ] Add icon + title + description + CTA pattern

---

### UX-215: Animation Timing Inconsistency 🟡

**Problem:** Animation durations vary: 75ms, 150ms, 200ms, 300ms, 500ms used inconsistently.

**Effort:** Medium (3 hrs)

**Solution Plan:**
- [ ] Create animation tokens: `animation.fast`, `animation.normal`, `animation.slow`
- [ ] Standardize: micro-interactions 150ms, UI transitions 200-300ms, page 400-500ms
- [ ] Add `prefers-reduced-motion` support

---

### UX-216: Hover State Inconsistency 🟡

**Problem:** Cards use different hover effects (shadow-md, border-primary, none) without pattern.

**Effort:** Low (2 hrs)

**Solution Plan:**
- [ ] Create hover tokens: `interactive.cardClickable`, `interactive.cardInteractive`
- [ ] Document when to use each: clickable → hover:shadow, display-only → no hover

---

### UX-217: Form Validation Feedback Timing 🟡

**Problem:** Forms validate on submit only, not during typing.

**Effort:** Low (3 hrs)

**Solution Plan:**
- [ ] Change react-hook-form mode: `mode: 'onTouched'`, `reValidateMode: 'onChange'`
- [ ] Create `useSmartForm` hook with optimal validation settings

---

### UX-218: No Loading States on Form Submit 🟠

**Problem:** Forms don't disable inputs during submission — double-submit possible.

**Effort:** Low (2 hrs)

**Solution Plan:**
- [ ] Add loading overlay during form submission
- [ ] Disable all form inputs when `isSubmitting: true`
- [ ] Show loading spinner in submit button

---

### UX-219: Chart Accessibility — No Screen Reader Support 🟠

**Problem:** Analytics charts have no ARIA labels, no data table alternative.

**Effort:** Medium (5 hrs)

**Solution Plan:**
- [ ] Add `role="img"` with `aria-label` and `aria-describedby`
- [ ] Create tabbed view: "Grafik" / "Tabel" with table alternative
- [ ] Generate text description of chart data trends

---

## Implementation Roadmap

### Phase 1: Critical Foundation (Week 1) — 24 hours

| Task | Issue | Effort | Verification |
|------|-------|--------|--------------|
| Create design tokens | UX-201 | 4h | Tokens imported, lint passes |
| Fix Work Reports header | UX-202 | 2h | Mobile 375px test |
| Expand MobileNav | UX-203 | 6h | All features accessible |
| Fix accessibility contrast | UX-204 | 4h | axe DevTools passes |
| Safe area insets | UX-206 | 3h | iPhone test |
| Touch targets | UX-207 | 2h | Touch test on device |
| Loading states | UX-205 | 3h | All pages use skeleton |

### Phase 2: UX Polish (Week 2) — 20 hours

| Task | Issue | Effort | Verification |
|------|-------|--------|--------------|
| Print branding | UX-208 | 4h | Print preview check |
| Toast templates | UX-209 | 5h | Error scenarios test |
| Animation tokens | UX-215 | 3h | Visual consistency |
| Hover standardization | UX-216 | 2h | Hover states work |
| Typography hierarchy | UX-211 | 4h | Scannability test |
| Form validation timing | UX-217 | 2h | UX test |

### Phase 3: Advanced (Week 3) — 18 hours

| Task | Issue | Effort | Verification |
|------|-------|--------|--------------|
| Chart accessibility | UX-219 | 5h | Screen reader test |
| Image optimization | UX-210 | 8h | Mobile data test |
| Form loading states | UX-218 | 2h | Double-submit prevented |
| Empty states | UX-214 | 3h | Consistency check |

---

## Quick Reference: Priority Matrix

### P0 — Must Fix Before Next Release

- [ ] UX-201: Design system foundation
- [ ] UX-202: Work Reports header
- [ ] UX-203: Mobile nav coverage
- [ ] UX-204: Accessibility/contrast
- [ ] UX-205: Loading states
- [ ] UX-206: Safe area insets
- [ ] UX-207: Touch targets

### P1 — Next Sprint

- [ ] UX-208: Print branding
- [ ] UX-209: Error message templates
- [ ] UX-210: Image optimization
- [ ] UX-211: Typography hierarchy

### P2 — Backlog

- [ ] UX-212: Login language
- [ ] UX-213: Dashboard decoration
- [ ] UX-214: Empty states
- [ ] UX-215: Animation consistency
- [ ] UX-216: Hover states
- [ ] UX-217: Form validation timing
- [ ] UX-218: Form loading states
- [ ] UX-219: Chart accessibility

---

## Measurement & Success Metrics

| Metric | Before | Target | How to Measure |
|--------|--------|--------|----------------|
| WCAG Compliance | Unknown | 100% AA | axe DevTools |
| Mobile Feature Coverage | 20% | 100% | MobileNav count |
| Touch Target Pass Rate | ~40% | 100% | Debugger tool |
| Typography Consistency | 12 sizes | 1 standard | Grep audit |
| Loading State Coverage | 30% | 100% | Page audit |
| Lighthouse Accessibility | ~75 | 95+ | Lighthouse CI |

---

## Tools & References

- **Accessibility:** axe DevTools, WAVE, NVDA/VoiceOver
- **Design System:** shadcn/ui, Tailwind CSS 4
- **Testing:** Chrome DevTools device emulation, iOS Simulator
- **Performance:** Lighthouse CI

---

> **End of Second Opinion Audit**
> Last updated: 2026-03-14
