# WBS Deep Scan: M-20 — Testing

> **Scope:** Comprehensive test suite coverage including centralized infrastructure tests, feature-level unit tests, characterization tests, and Playwright E2E flows.
> **Note:** Log Sheet System (EP-010) testing is handled separately in M-11g.

## File Manifest

| Path | Lines | Purpose | Covered By |
| :--- | --: | :--- | :--- |
| `src/__tests__/setup.ts` | 30 | Vitest global setup (DOM mocks, RTL cleanup) | TK-016-034 |
| `src/lib/rbac.test.ts` | 116 | Role-based access control logic tests | TK-016-037 |
| `src/lib/auth-helpers.test.ts` | 331 | Authentication session and actor retrieval tests | TK-016-037 |
| `src/lib/action-helpers.test.ts` | 121 | Server action result wrapper tests | TK-016-043 |
| `src/features/users/actions.test.ts` | 150 | User management server action tests | TK-002-010 |
| `src/features/users/service.test.ts` | 200 | User service layer logic tests | TK-002-011 |
| `src/features/projects/*.test.ts/tsx` | 450 | Project types, contract types, and reporting scope tests | TK-004-015 |
| `src/features/parameters/limits-*.test.ts` | 180 | Parameter limit validation and utility tests | TK-009-020 |
| `src/features/work-reports/*.test.ts/tsx` | 600 | Work report signatures and repository tests | TK-011-025 |
| `src/features/notifications/*.test.ts/tsx` | 220 | Notification service and hook tests | TK-013-010 |
| `src/features/dashboard/utils.test.ts` | 85 | Dashboard analytical helper tests | TK-014-008 |
| `src/__tests__/e2e/log-sheet/full-workflow.spec.ts` | 217 | E2E: Complete technician submission flow | TK-016-040 |
| `src/__tests__/e2e/log-sheet/approval.spec.ts` | 288 | E2E: Admin approval and locking workflow | TK-016-041 |
| `src/__tests__/e2e/log-sheet/validation-recovery.spec.ts` | 446 | E2E: Error handling and form recovery | TK-016-042 |
| `src/__tests__/e2e/log-sheet/draft-flow.spec.ts` | 114 | E2E: Saving and resuming drafts | TK-016-040 |
| `src/__tests__/e2e/log-sheet/admin-override.spec.ts` | 157 | E2E: Admin edit/unlock capabilities | TK-016-041 |
| `src/__tests__/e2e/fixtures/log-sheet-fixture.ts` | 334 | E2E: Page object helpers for log sheets | TK-016-039 |

## WBS Table

### EP-016: Infrastructure & Foundation (Testing Expansion)

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **WP-016-005** | AC-016-005 | **Work Package** | **Quality Assurance (Testing Infrastructure)** | **—** | **—** | **—** | **Σ** |
| TK-016-034 | WP-016-005 | Task | Vitest global setup: DOM mocks, RTL, and Prisma mocks | 1.5 | 3 | 5 | 3.08 |
| TK-016-037 | WP-016-005 | Task | Core Security Tests: RBAC and Auth helper policy tests | 1.5 | 3 | 5 | 3.08 |
| TK-016-038 | WP-016-005 | Task | Playwright E2E Framework: configuration and setup | 2 | 4 | 8 | 4.33 |
| TK-016-039 | WP-016-005 | Task | E2E Fixtures: Log sheet page objects and data factories | 2 | 4 | 7 | 4.17 |
| TK-016-040 | WP-016-005 | Task | E2E Suite: Full technician workflow (draft to submit) | 2 | 4 | 8 | 4.33 |
| TK-016-041 | WP-016-005 | Task | E2E Suite: Admin workflows (approval, override, unlock) | 2 | 4 | 8 | 4.33 |
| TK-016-042 | WP-016-005 | Task | E2E Suite: Validation & Error Recovery scenarios | 3 | 5 | 10 | 5.50 |
| TK-016-043 | WP-016-005 | Task | Action Helpers: server action response wrapper tests | 0.5 | 1 | 2 | 1.08 |

### EP-002: User Management (Testing WP)

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **WP-002-003** | AC-002 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-002-010 | WP-002-003 | Task | Users server actions unit tests (actions.test.ts) | 2 | 4 | 6 | 4.00 |
| TK-002-011 | WP-002-003 | Task | Users service layer unit tests (service.test.ts) | 2 | 4 | 6 | 4.00 |

### EP-004: Project Management (Testing WP)

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **WP-004-004** | AC-004-001 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-004-015 | WP-004-004 | Task | Project Types & Reporting Scope unit tests | 2 | 4 | 7 | 4.17 |

### EP-009: Parameter & Limit Profiles (Testing WP)

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **WP-009-003** | AC-009-001 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-009-020 | WP-009-003 | Task | Parameter limit validation logic and utility tests | 1 | 2 | 4 | 2.17 |

### EP-011: Work Reports (Testing WP)

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **WP-011-003** | AC-011-001 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-011-025 | WP-011-003 | Task | Work Report signature and repository integration tests | 2 | 4 | 6 | 4.00 |

### EP-013: Notifications (Testing WP)

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **WP-013-003** | AC-013-001 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-013-010 | WP-013-003 | Task | Notification service and real-time hook tests | 1.5 | 3 | 5 | 3.08 |

### EP-014: Dashboard (Testing WP)

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **WP-014-003** | AC-014-001 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-014-008 | WP-014-003 | Task | Dashboard analytical helper tests (utils.test.ts) | 0.5 | 1 | 2 | 1.08 |

## Confidence Assessment

- [x] Every file from the checklist has ≥ 1 Task
- [x] All Task rows have O, L, P, E values
- [x] E = (O + 4L + P) / 6 for each Task
- [x] IDs are sequential (within their respective expanded WPs)
- [x] No fabricated features
- [x] No duplicate work with other Epics (E2E centralized in EP-016)

**Confidence Score: 95% [🟢]**
- The testing volume is high, with clear separation between infrastructure and feature logic.
- E2E suite is well-covered with fixtures and page objects.
- All core business logic identified in the `find` scan has been mapped to a task.
