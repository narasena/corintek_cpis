# FEAT-007: Standardize Form Action Bar for Mobile

**Status:** Ready | **Priority:** P0 | **Estimate:** 3-4 hours

## Problem

Technicians on mobile must scroll up to find save/submit buttons on long forms.
The log-sheet page already has a fixed bottom action bar, but no other form uses it.
The pattern needs to be extracted into a shared component and applied consistently.

**Forms affected:**
| Form | Current Button Position | Mobile Scrolling | Need Fix? |
|------|------------------------|------------------|-----------|
| Log Sheet (page) | Top toolbar + fixed bottom bar | Yes (long) | Already done — reference |
| Lab Analysis (page) | Bottom inline, NOT sticky | Yes (long + table) | **P1** |
| Work Report (dialog) | Bottom inline, NOT sticky | Yes (photo sections) | **P1** |
| Profile Limits (dialog) | Top only | Yes (long accordion) | **P2** |
| Summary Reports (page) | Bottom inline, NOT sticky | Mild | P3 (optional) |
| My Profile (page) | Bottom w-full | Minimal | Skip |
| Client/Parameter (dialogs) | Sticky bottom via `sticky bottom-[-24px]` | Yes | Already working |

## Design Decision

**Both top + bottom.** Top toolbar for nav/context, fixed/sticky bottom bar for actions.
- Page variant: `fixed bottom-16` (above the 64px bottom navbar), `md:hidden` only
- Dialog variant: `sticky bottom-0 bg-background/95 backdrop-blur-sm border-t` inside scroll container

### Why not bottom-only?

Top toolbar still needed for navigation (back, project link, view toggle). "Bottom-only" really means two bars anyway.

### Why not FAB/overlay?

- Existing bottom navbar already occupies `fixed bottom-0 z-50`
- Forms have 2-3 actions (cancel, draft, submit) — FABs don't handle multi-action well
- Overlay would compete with navbar for thumb zone

---

## Ticket 1: Create `FormActionBar` shared component

**File:** `src/components/form-action-bar.tsx` (new)

### Props

```typescript
interface IFormActionBarProps {
  /** Variant: "page" = fixed above navbar (mobile only), "dialog" = sticky inside scroll */
  variant: 'page' | 'dialog';
  /** Show the bar. Condition on scroll/form state. */
  show?: boolean;
  /** Action buttons in order (left to right) */
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'destructive' | 'secondary';
    disabled?: boolean;
    loading?: boolean;
    /** flex-1 for equal-width buttons when only 2 actions */
    fill?: boolean;
  }>;
}
```

### Implementation

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// [interface above]

export function FormActionBar({ variant, show = true, actions }: IFormActionBarProps) {
  if (!show || actions.length === 0) return null;

  const containerClass = variant === 'page'
    ? 'fixed bottom-16 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-50 md:hidden'
    : 'sticky bottom-0 p-4 bg-background/95 backdrop-blur-sm border-t z-10 flex gap-2 -mx-6 -mb-6';

  // Page variant: 2 actions get flex-1 equal width. Dialog variant: inline justified.
  const buttonClass = variant === 'page' && actions.length <= 2
    ? 'flex-1'
    : '';

  return (
    <div className={containerClass}>
      {actions.map((action, i) => (
        <Button
          key={i}
          type={action.onClick ? 'button' : 'submit'}
          variant={action.variant ?? 'default'}
          onClick={action.onClick}
          disabled={action.disabled}
          className={buttonClass}
        >
          {action.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {action.label}
        </Button>
      ))}
    </div>
  );
}
```

### Acceptance Criteria
- [ ] Component renders nothing when `show=false` or `actions=[]`
- [ ] Page variant: `fixed bottom-16`, `md:hidden`, `z-50` — sits above bottom navbar
- [ ] Dialog variant: `sticky bottom-0`, `z-10` — sits inside scroll container
- [ ] 2 actions on page variant → equally sized with `flex-1`
- [ ] Loading spinner on `loading=true`
- [ ] `print:hidden` by default (bar is inside `print:hidden` parent, or add explicitly)

### Test
- [ ] Render page variant → DOM has `fixed bottom-16`
- [ ] Render dialog variant → DOM has `sticky bottom-0`
- [ ] `show=false` → renders null
- [ ] Empty actions array → renders null

---

## Ticket 2: Add `FormActionBar` to Log Sheet page (refactor)

**File:** `src/app/(main)/log-sheets/[projectId]/[logSheetId]/page.tsx`

### What changes

Replace the inline fixed bottom bar (lines 645-663) with `<FormActionBar>`.

**Before (lines 644-663):**
```tsx
{/* Sticky Action Bar for Mobile */}
{effectiveMode === 'input' && detail.logSheet.status === 'DRAFT' && (
  <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t flex gap-2 md:hidden z-50">
    <Button className="flex-1" variant="outline" onClick={handleSave} disabled={isPending}>
      Simpan Draft
    </Button>
    <Button className="flex-1" onClick={handleSubmitRequest} disabled={isPending}>
      Kirim
    </Button>
  </div>
)}
```

**After:**
```tsx
<FormActionBar
  variant="page"
  show={effectiveMode === 'input' && detail.logSheet.status === 'DRAFT'}
  actions={[
    { label: 'Simpan Draft', onClick: handleSave, variant: 'outline', disabled: isPending },
    { label: 'Kirim', onClick: handleSubmitRequest, disabled: isPending },
  ]}
/>
```

### Acceptance Criteria
- [ ] Same visual appearance and behavior as before
- [ ] Top toolbar still renders "Tindakan" dropdown with same actions (desktop access)
- [ ] Mobile: bottom bar shows only when `mode=input` and `status=DRAFT`
- [ ] Both buttons work: save → toast, submit → toast
- [ ] Print: bar not visible

### Blast Radius
- `LogSheetToolbar` is NOT touched — it remains the top toolbar
- Only the mobile bottom bar is replaced

---

## Ticket 3: Add `FormActionBar` to Lab Analysis form

**File:** `src/features/lab-analyses/components/lab-analysis-form.tsx`

### Current state (lines 545-557)

```tsx
<div className="flex items-center justify-end gap-2">
  <Button type="button" variant="outline" onClick={...} disabled={isPending}>Batal</Button>
  <Button type="button" onClick={handleSubmit} disabled={isPending}>
    {isPending ? 'Menyimpan...' : 'Simpan'}
  </Button>
</div>
```

Buttons are at the bottom of the form but NOT sticky. On mobile, user scrolls past the long parameter table, past remarks/recommendations, to find them. If the form is tall enough to scroll, the buttons are off-screen.

### What changes

1. Keep the existing bottom buttons (desktop access, final natural flow).
2. Add `<FormActionBar variant="page">` at the end of the form (after the existing buttons).

```tsx
{/* Desktop buttons (keep as-is) */}
<div className="hidden md:flex items-center justify-end gap-2">
  <Button type="button" variant="outline" onClick={...}>Batal</Button>
  <Button type="button" onClick={handleSubmit} disabled={isPending}>
    {isPending ? 'Menyimpan...' : 'Simpan'}
  </Button>
</div>

{/* Mobile fixed bar */}
<FormActionBar
  variant="page"
  show={!isReadOnly}
  actions={[
    { label: 'Batal', onClick: () => router.push(`/lab-analyses/${projectId}`), variant: 'outline', disabled: isPending },
    { label: isPending ? 'Menyimpan...' : 'Simpan', onClick: handleSubmit, disabled: isPending, loading: isPending },
  ]}
/>
```

### Potential complication: edit mode

Check if the form has an edit mode (it loads existing data for `labAnalysisId`). If the page is used for both create AND edit, the bar needs the right button labels ("Simpan" for both). Confirm by reading the form header logic.

### Acceptance Criteria
- [ ] Mobile: fixed bottom bar appears above navbar while form is visible
- [ ] Desktop: original inline buttons still show (bottom of form)
- [ ] "Batal" → navigates back to lab analysis list
- [ ] "Simpan" → saves (create or update), toasts success
- [ ] Loading state shows spinner
- [ ] Bar hidden when `isReadOnly` (view-only mode)
- [ ] Print: bar not visible

---

## Ticket 4: Add `FormActionBar` to Work Report form (dialog variant)

**File:** `src/features/work-reports/components/work-report-form.tsx`

### Current state (lines 605-657)

Three buttons in a `flex justify-end space-x-2 pt-4 border-t` at the bottom of the form: Batal, Simpan Draft, Kirim ke PIC. Not sticky. Form is long (date/time, zone, machine multi-select, 3 textareas, 3 photo sections, signature section).

### What changes

The work report form lives inside a `CrudDialog` (scroll container `max-h-[90dvh] overflow-y-auto`). Use **dialog variant** — `sticky bottom-0` inside the scroll container.

1. Replace the existing static button row with `<FormActionBar variant="dialog">`.
2. The dialog variant needs `-mx-6 -mb-6` to match CrudDialog's padding pattern.

```tsx
{/* Replace lines 605-657 with: */}
<FormActionBar
  variant="dialog"
  actions={[
    { label: 'Batal', onClick: onCancel, variant: 'outline', disabled: isPending },
    {
      label: isPending && statusIntent === 'DRAFT' ? (submitStatus || 'Menyimpan...') : 'Simpan Draft',
      onClick: () => { statusIntentRef.current = 'DRAFT'; setStatusIntent('DRAFT'); },
      variant: 'outline',
      disabled: isPending,
      loading: isPending && statusIntent === 'DRAFT',
    },
    {
      label: isPending && statusIntent === 'SUBMITTED' ? (submitStatus || 'Mengirim...') : 'Kirim ke PIC',
      onClick: () => { statusIntentRef.current = 'SUBMITTED'; setStatusIntent('SUBMITTED'); },
      disabled: isPending || (effectiveData ? effectiveData.status !== 'DRAFT' : false) || !effectiveData?.technicianSignatureUrl || !effectiveData?.clientPicSignatureUrl,
      loading: isPending && statusIntent === 'SUBMITTED',
    },
  ]}
/>
```

**Important:** Form uses `type="submit"` on Simpan Draft and Kirim buttons to trigger `form.handleSubmit(onSubmit)`. The `FormActionBar` buttons use `type="button"` with explicit `onClick`. Since the existing buttons already set `statusIntentRef` before form submission fires, the onClick approach works identically — the form's `onSubmit` runs via `form.handleSubmit` and reads `statusIntentRef.current`.

Wait — that's wrong. The existing buttons have `type="submit"` which triggers the `<form onSubmit={form.handleSubmit(onSubmit)}>`. If we change to `type="button"`, the form won't submit.

**Fix:** The Simpan Draft and Kirim buttons need to trigger form submission programmatically. Use a form ref.

```tsx
const formRef = useRef<HTMLFormElement>(null);

// In the <form> tag:
<form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

// In FormActionBar actions:
{
  label: 'Simpan Draft',
  onClick: () => {
    statusIntentRef.current = 'DRAFT';
    setStatusIntent('DRAFT');
    formRef.current?.requestSubmit();
  },
  ...
}
```

### Acceptance Criteria
- [ ] Dialog variant: bar sticks to bottom of dialog while scrolling
- [ ] Three buttons: Batal, Simpan Draft, Kirim ke PIC
- [ ] Kirim ke PIC disabled when: pending, status != DRAFT, or signatures missing
- [ ] Loading states work per-button (individual spinners)
- [ ] Dialogs that wrap this form (create, edit, list) all get the sticky bar
- [ ] Print: bar not visible (dialog already has print:hidden)

---

## Ticket 5: Fix Profile Limits form — move save to bottom

**File:** `src/features/parameter-limit-profiles/components/profile-limits-form.tsx`

### Current state (lines 461-494)

Save button is at TOP of the form in a `flex justify-between items-center` row. Below it is a long `<Accordion>` with 7 categories of parameter limits. On mobile, user scrolls down through accordion items and must scroll back UP to save. This is a bug.

### What changes

1. Move the action bar from top to bottom.
2. Keep "Tambah Parameter" and "Salin dari Master" visible at top (non-save actions) OR move all to bottom.
3. Add `<FormActionBar variant="dialog">` at bottom.

**Decision:** Keep "Tambah Parameter" + "Salin dari Master" at top (they affect what you're editing), move "Simpan" to bottom.

**After:**

```tsx
{/* Top bar: description + management actions */}
<div className="flex justify-between items-center">
  <p className="text-sm text-muted-foreground">
    Kelola batas untuk setiap parameter dalam profil ini.
  </p>
  <div className="flex gap-2">
    <Button type="button" variant="outline" size="sm" onClick={...}>
      <Plus className="mr-2 h-4 w-4" /> Tambah Parameter
    </Button>
    <Button type="button" variant="outline" size="sm" onClick={...} disabled={isCopying}>
      {isCopying && <Loader2 ... />}
      <Copy className="mr-2 h-4 w-4" /> Salin dari Master
    </Button>
    {/* Simpan REMOVED from here */}
  </div>
</div>

{/* ... accordion ... */}

{/* Bottom: save button */}
<FormActionBar
  variant="dialog"
  show={groupedLimits.length > 0}
  actions={[
    {
      label: isPending ? 'Menyimpan...' : 'Simpan',
      onClick: () => formRef.current?.requestSubmit(),
      disabled: isPending,
      loading: isPending,
    },
  ]}
/>
```

**Form ref needed** since we're replacing a `type="submit"` button with a `type="button"`:

```tsx
const formRef = useRef<HTMLFormElement>(null);
// <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} ...>
```

### Acceptance Criteria
- [ ] "Simpan" button is at the bottom of the form, not top
- [ ] "Tambah Parameter" and "Salin dari Master" stay at top
- [ ] Dialog variant: sticky bottom inside CrudDialog scroll
- [ ] Save works: validates form, upserts limits, toasts success
- [ ] Loading spinner on save
- [ ] Bar hidden when no limits exist (empty accordion)

---

## Ticket 6: Add `FormActionBar` to Summary Reports page (optional)

**File:** `src/app/(main)/summary-reports/page.tsx`

### Current state (lines 349-370)

Three buttons at bottom: Batal / Cetak Lampiran / Buat & Cetak. Not sticky. Form scrolls mildly on mobile.

### What changes

Add page variant for mobile only. Low urgency — this form mostly fits on screen.

```tsx
<FormActionBar
  variant="page"
  actions={[
    { label: 'Batal', onClick: handleCancel, variant: 'outline' },
    { label: 'Cetak Lampiran', onClick: handlePrintAttachment, variant: 'outline' },
    { label: 'Buat & Cetak', onClick: handleCreateAndPrint },
  ]}
/>
```

### Acceptance Criteria
- [ ] Mobile: fixed bottom bar with 3 buttons
- [ ] Desktop: original inline buttons unchanged

---

## Implementation Order

1. **Ticket 1** — Create `FormActionBar` component (dependency for all others)
2. **Ticket 2** — Refactor log-sheet to use it (lowest risk, already works)
3. **Ticket 3** — Lab analysis (page variant)
4. **Ticket 4** — Work report (dialog variant)
5. **Ticket 5** — Profile limits (dialog variant + fix top-only bug)
6. **Ticket 6** — Summary reports (optional, low priority)

## Verification Checklist

- [ ] `npm run build` passes
- [ ] No new TypeScript errors
- [ ] Mobile view: all affected forms have sticky action bar
- [ ] Desktop view: no regression (bars hidden or sticky in dialog)
- [ ] Print mode: no action bars visible
- [ ] Bottom navbar (`bottom-0`, `h-16`) doesn't overlap action bar (`bottom-16`)

## Notes for lesser models

- The `FormActionBar` component goes in `src/components/form-action-bar.tsx` — that's the shared components directory
- The page variant uses `bottom-16` because the mobile bottom nav is `h-16` (64px) at `bottom-0`
- The dialog variant uses `sticky bottom-0` and negative margins to span the dialog container's padding
- When replacing `type="submit"` buttons with onClick handlers, you need a `<form ref={formRef}>` and call `formRef.current?.requestSubmit()`
- Do NOT add `<Toaster />` — it's already in root layout
- Tailwind 4, so use Tailwind classes only. No custom CSS.
- Follow existing naming: `IFormActionBarProps` for the interface
