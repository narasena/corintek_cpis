---
name: "cpis-ui-check"
description: "Enforces CPIS UI standards (Toast Protocol, CRUD Tables). Invoke when creating/modifying UI components, forms, or pages."
---

# CPIS UI Standard Enforcer

This skill ensures all UI implementations follow the project's strict design and feedback protocols.

## 🔔 The "Toast" Protocol

**MANDATORY:** All user-facing actions (Create, Update, Delete, Login, etc.) MUST provide immediate feedback.

-   **Library:** `sonner`
-   **Usage:**
    -   Success: `toast.success("Title", { description: "..." })`
    -   Error: `toast.error("Title", { description: "..." })`
-   **Placement:** Root layout handles `<Toaster />`. Do not add it again.

## 📊 The "CRUD Management Table" Standard

**MANDATORY:** All domain CRUD pages (Users, Projects, etc.) MUST use shared components.

-   **Path:** `src/components/`
-   **Required Components:**
    -   `DataTable` (Generic table with pagination)
    -   `CrudDialog` (Wrapper for forms)
    -   `ActionCell` (Edit/Delete dropdowns)
-   **Localization:**
    -   "Ubah" (Edit)
    -   "Hapus" (Delete)
    -   "Tambah" (Add)

## 🚫 Constraints

-   ❌ **NO** Custom CSS files (Use Tailwind 4 utility classes).
-   ❌ **NO** Custom table implementations (Use `DataTable`).
-   ❌ **NO** Drag-and-drop, complex filters (unless explicitly requested).

## 🖨️ PDF & Print Rules

-   **NO** Backend PDF generation.
-   **USE** Browser-native print (`@media print`).
-   **HIDE** Nav/Buttons during print.
