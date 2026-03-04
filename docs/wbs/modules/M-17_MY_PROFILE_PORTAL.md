# WBS Module Scan: M-17 — My Profile & Client Portal

## EP-015: User Profile & Client Portal

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-015** | — | **Epic** | **User Profile & Client Portal** | **—** | **—** | **—** | **Σ** |
| **US-015-001** | EP-015 | **User Story** | **As a user, I want to manage my personal profile and view assigned projects** | **—** | **—** | **—** | **Σ** |
| **AC-015-001** | US-015-001 | **Acceptance Criteria** | **Profile self-service (edit text, update avatar)** | **—** | **—** | **—** | **Σ** |
| **WP-015-001** | AC-015-001 | **Work Package** | **Frontend (Profile UI)** | **—** | **—** | **—** | **Σ** |
| TK-015-001 | WP-015-001 | Task | MyProfilePage: Server layout, profile data fetching & container | 0.5 | 1 | 2 | 1.08 |
| TK-015-002 | WP-015-001 | Task | ProfileForm: Zod integration, Form UI, Toast feedback | 2 | 4 | 6 | 4.00 |
| TK-015-003 | WP-015-001 | Task | Avatar Management: Image preview, fallback logic, upload trigger | 1.5 | 3 | 5 | 3.08 |
| **WP-015-002** | AC-015-001 | **Work Package** | **Backend (Profile Logic)** | **—** | **—** | **—** | **Σ** |
| TK-015-004 | WP-015-002 | Task | Profile Server Actions: Fetch current, Update data (revalidation) | 1 | 2 | 4 | 2.17 |
| TK-015-005 | WP-015-002 | Task | Avatar Upload Action: R2 integration, metadata handling | 2 | 4 | 7 | 4.17 |
| TK-015-006 | WP-015-002 | Task | Profile Service: Prisma queries for self-service updates | 0.5 | 1.5 | 3 | 1.67 |
| **WP-015-003** | AC-015-001 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-015-007 | WP-015-003 | Task | Unit tests for Profile Actions (Mocks, success/fail paths) | 1 | 2 | 4 | 2.17 |
| TK-015-008 | WP-015-003 | Task | Service tests for Profile CRUD and phone uniqueness | 1 | 2 | 3 | 2.00 |
| **AC-015-002** | US-015-001 | **Acceptance Criteria** | **Read-only Client/Technician project portal** | **—** | **—** | **—** | **Σ** |
| **WP-015-004** | AC-015-002 | **Work Package** | **Frontend (Portal UI)** | **—** | **—** | **—** | **Σ** |
| TK-015-009 | WP-015-004 | Task | MyProjectPage: Dashboard summary for specific project assignment | 1 | 2 | 4 | 2.17 |
| TK-015-010 | WP-015-004 | Task | ForbiddenPage: Unauthorized access fallback UI | 0.5 | 1 | 2 | 1.08 |
| TK-015-011 | WP-015-004 | Task | NavUser: Dropdown profile & settings links integration | 0.5 | 1 | 1.5 | 1.00 |
| **WP-015-005** | AC-015-002 | **Work Package** | **Backend (Portal Logic)** | **—** | **—** | **—** | **Σ** |
| TK-015-012 | WP-015-005 | Task | Project Access Policy: buildProjectAccessWhere RBAC-safe logic | 1.5 | 3 | 5 | 3.08 |

### File Manifest — M-17: My Profile & Client Portal

| #   | File                                      | Lines | Functions | Covered By | Complexity             |
| :-- | :---------------------------------------- | ----: | --------: | :--------- | :--------------------- |
| 1   | `src/app/(main)/my-profile/page.tsx`      |    23 |         1 | TK-015-001 | Standard               |
| 2   | `src/features/users/components/profile-form.tsx` |   136 |         2 | TK-015-002, TK-015-003 | Standard               |
| 3   | `src/app/(main)/my-projects/[projectId]/page.tsx` |    74 |         1 | TK-015-009 | Standard               |
| 4   | `src/app/(main)/forbidden/page.tsx`       |    15 |         1 | TK-015-010 | Standard               |
| 5   | `src/features/users/actions.ts` (Profile parts) |    80 |         3 | TK-015-004, TK-015-005 | 🔗 Integration-heavy |
| 6   | `src/features/users/service.ts` (Profile parts) |    40 |         2 | TK-015-006 | Standard               |
| 7   | `src/features/projects/access-policy.ts`  |    55 |         2 | TK-015-012 | 📋 Business rules    |
| 8   | `src/@types/user.type.ts` (Profile parts) |    35 |         0 | TK-015-002 | Standard               |
| 9   | `src/features/users/actions.test.ts`      |   120 |         3 | TK-015-007 | Standard               |
| 10  | `src/features/users/service.test.ts`      |    90 |         2 | TK-015-008 | Standard               |

### Confidence: 98%

**Justification:**
- Files scanned: 10/10 (100% of identified scope)
- Functions covered: All critical profile and portal access functions analyzed.
- Cross-ref vs fast scan: Matched 5/5 tasks from fast scan, added 7 additional tasks for better granularity (testing, R2 integration detail, RBAC policy logic).
- RBAC validation: Verified that `isProjectScopedRole` correctly handles CLIENT roles in the service layer.

**Status:** 🟢 High Confidence
