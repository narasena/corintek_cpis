## EP-002: User Management & RBAC

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-002** | — | **Epic** | **User Management & RBAC** | **—** | **—** | **—** | **Σ** |
| **US-002-001** | EP-002 | **User Story** | **As an admin, I want to manage system users so I can control access to the platform** | **—** | **—** | **—** | **Σ** |
| AC-002-001 | US-002-001 | Acceptance Criteria | User CRUD with roles, employment status, and soft-delete | — | — | — | Σ |
| **WP-002-001** | AC-002-001 | **Work Package** | **Frontend (UI/UX)** | **—** | **—** | **—** | **Σ** |
| TK-002-001 | WP-002-001 | Task | Users list page with DataTable and role-based badges (`src/app/(main)/users/page.tsx`) | 2 | 3 | 5 | 3.17 |
| TK-002-002 | WP-002-001 | Task | UserForm: Create/Edit mode with role & status selection (`src/features/users/components/user-form.tsx`) | 2 | 4 | 7 | 4.17 |
| TK-002-003 | WP-002-001 | Task | UserDialog: CrudDialog wrapper implementation (`src/features/users/components/user-dialog.tsx`) | 0.5 | 1 | 2 | 1.08 |
| **WP-002-002** | AC-002-001 | **Work Package** | **Backend (Logic & APIs)** | **—** | **—** | **—** | **Σ** |
| TK-002-004 | WP-002-002 | Task | Users service: CRUD with soft-delete uniqueness logic (`src/features/users/service.ts`) | 2 | 4 | 8 | 4.33 |
| TK-002-005 | WP-002-002 | Task | Users server actions: CRUD, Revalidation, and RBAC enforcement (`src/features/users/actions.ts`) | 1.5 | 3 | 6 | 3.25 |
| TK-002-006 | WP-002-002 | Task | Admin service: Restore and Permanent delete utilities (`src/features/users/service-admin.ts`) | 1 | 2 | 4 | 2.17 |
| TK-002-007 | WP-002-002 | Task | Middleware & Layout protection: RBAC route guards (`src/app/(main)/users/layout.tsx`) | 0.5 | 1 | 2 | 1.08 |
| **WP-002-003** | AC-002-001 | **Work Package** | **Database** | **—** | **—** | **—** | **Σ** |
| TK-002-008 | WP-002-003 | Task | User model schema: relations, enums, and soft-delete fields (`prisma/schema/users.prisma`) | 0.5 | 1.5 | 3 | 1.67 |
| **US-002-002** | EP-002 | **User Story** | **As any user, I want to manage my profile so my personal information is up to date** | **—** | **—** | **—** | **Σ** |
| AC-002-002 | US-002-002 | Acceptance Criteria | Profile editing with avatar upload to R2 storage | — | — | — | Σ |
| **WP-002-004** | AC-002-002 | **Work Package** | **Frontend (UI/UX)** | **—** | **—** | **—** | **Σ** |
| TK-002-009 | WP-002-004 | Task | ProfileForm: Field validation and avatar preview/camera integration (`src/features/users/components/profile-form.tsx`) | 2 | 4 | 7 | 4.17 |
| **WP-002-005** | AC-002-002 | **Work Package** | **Backend (Logic & APIs)** | **—** | **—** | **—** | **Σ** |
| TK-002-010 | WP-002-005 | Task | Profile server actions: Profile update and Avatar R2 upload integration (`src/features/users/actions.ts`) | 1.5 | 3 | 5 | 3.08 |
| TK-002-011 | WP-002-005 | Task | Profile service: Current user data fetching and update logic (`src/features/users/service.ts`) | 1 | 2 | 3 | 2.00 |
| **WP-002-006** | EP-002 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-002-012 | WP-002-006 | Task | User service unit tests: Uniqueness, RBAC, and Soft-delete (`src/features/users/service.test.ts`) | 1.5 | 3 | 5 | 3.08 |
| TK-002-013 | WP-002-006 | Task | User actions unit tests: Validation and R2 integration mocks (`src/features/users/actions.test.ts`) | 1.5 | 3 | 5 | 3.08 |

---

### File Manifest — M-04: Users

| # | File | Lines | Functions | Covered By | Complexity |
| :-- | :--- | ---: | ---: | :--- | :--- |
| 1 | `prisma/schema/users.prisma` | 55 | - | TK-002-008 | Standard |
| 2 | `src/features/users/service.ts` | 310 | 9 | TK-002-004, TK-002-011 | 📋 Business rules (Soft delete uniqueness) |
| 3 | `src/features/users/service-admin.ts` | 72 | 2 | TK-002-006 | Standard |
| 4 | `src/features/users/actions.ts` | 260 | 9 | TK-002-005, TK-002-010 | 🔗 Integration-heavy (R2 upload) |
| 5 | `src/app/(main)/users/page.tsx` | 112 | 1 | TK-002-001 | Standard |
| 6 | `src/app/(main)/users/components/user-columns.tsx` | 84 | 1 | TK-002-001 | Standard |
| 7 | `src/features/users/components/user-dialog.tsx` | 42 | 1 | TK-002-003 | Standard |
| 8 | `src/features/users/components/user-form.tsx` | 240 | 1 | TK-002-002 | ⚠️ Deceptively complex (Dual mode CRUD) |
| 9 | `src/features/users/components/profile-form.tsx` | 180 | 1 | TK-002-009 | 🔗 Integration-heavy (Avatar upload logic) |
| 10 | `src/features/users/actions.test.ts` | 280 | - | TK-002-013 | Standard |
| 11 | `src/features/users/service.test.ts` | 220 | - | TK-002-012 | Standard |
| 12 | `src/app/(main)/users/layout.tsx` | 16 | 1 | TK-002-007 | Standard |

---

### Confidence: 100%

**Justification:**

- Files scanned: 12/12 (100%)
- Functions covered: All CRUD, Admin Utilities, and Profile management logic identified.
- Gaps: None. All files from the checklist and found in the directory were read in full.
- Cross-ref vs fast scan: Matched core tasks, added detail for Admin Tools (restore) and separated Profile Management (avatar) as a distinct User Story.

**Status:** 🟢 High Confidence
