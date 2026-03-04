# WBS: M-15 Notifications

## EP-013: Notification System

| ID | Parent | Type | Item | O | L | P | E |
| :-- | :----- | :--- | :--- | --: | --: | --: | --: |
| **EP-013** | — | **Epic** | **Notification System** | **—** | **—** | **—** | **Σ** |
| **US-013-001** | EP-013 | **User Story** | **As a user, I want to receive real-time alerts for critical system events** | **—** | **—** | **—** | **Σ** |
| AC-013-001 | US-013-001 | Acceptance Criteria | Notification bell with unread count and item list with Read/Unread state | — | — | — | Σ |
| **WP-013-001** | AC-013-001 | **Work Package** | **Frontend (Alerts UI)** | **—** | **—** | **—** | **Σ** |
| TK-013-001 | WP-013-001 | Task | NotificationBell: UI component for the navbar with real-time unread badge | 1 | 2 | 4 | 2.17 |
| TK-013-002 | WP-013-001 | Task | NotificationItem: layout for individual alerts by severity (INFO/WARNING/CRITICAL) | 0.5 | 1 | 2 | 1.08 |
| TK-013-003 | WP-013-001 | Task | useNotifications: client-side hook with 60s polling and optimistic updates | 1.5 | 2.5 | 4 | 2.58 |
| **WP-013-002** | AC-013-001 | **Work Package** | **Backend (Alerts Logic)** | **—** | **—** | **—** | **Σ** |
| TK-013-004 | WP-013-002 | Task | Notifications server actions (List, Read, Mark All) with path revalidation | 1 | 2 | 3 | 2.00 |
| TK-013-005 | WP-013-002 | Task | NotificationService: core business logic for evaluation and dispatch | 2 | 4 | 6 | 4.00 |
| TK-013-006 | WP-013-002 | Task | LimitBreachDetector: rules engine for identifying out-of-range parameters | 1.5 | 3 | 5 | 3.08 |
| TK-013-007 | WP-013-002 | Task | NotificationRepository: Prisma implementation with pagination and transactions | 1.5 | 2.5 | 4 | 2.58 |
| TK-013-008 | WP-013-002 | Task | Domain Types & Interfaces: Zod-like validation and comprehensive type system | 0.5 | 1 | 2 | 1.08 |
| **WP-013-003** | AC-013-001 | **Work Package** | **Database** | **—** | **—** | **—** | **Σ** |
| TK-013-009 | WP-013-003 | Task | Prisma schema: Notification model with indices and severity enums | 0.5 | 1 | 2 | 1.08 |
| **WP-013-004** | AC-013-001 | **Work Package** | **Testing & QA** | **—** | **—** | **—** | **Σ** |
| TK-013-010 | WP-013-004 | Task | Unit tests for NotificationService and LimitBreachDetector | 1.5 | 3 | 5 | 3.08 |
| TK-013-011 | WP-013-004 | Task | Hook tests with timer mocks for polling and optimistic state | 1 | 2 | 4 | 2.17 |

### File Manifest

| File | Lines | Purpose |
| :--- | :--- | :--- |
| `prisma/schema/notifications.prisma` | 25 | Schema definition for notifications and severity. |
| `src/features/notifications/types.ts` | 180 | Type system and service/repo interfaces. |
| `src/features/notifications/service.ts` | 250 | Breach detection and notification orchestration logic. |
| `src/features/notifications/notification-repository-prisma.ts` | 120 | Persistence layer using Prisma. |
| `src/features/notifications/actions.ts` | 60 | Server-side actions for Next.js integration. |
| `src/features/notifications/components/notification-bell.tsx` | 65 | Navbar bell component with dropdown. |
| `src/features/notifications/components/notification-item.tsx` | 45 | Individual notification row UI. |
| `src/features/notifications/components/use-notifications.ts` | 85 | State management, polling, and optimistic updates. |
| `src/features/notifications/__tests__/service.test.ts` | 150 | Unit tests for detector and service. |
| `src/features/notifications/components/__tests__/use-notifications.test.tsx` | 80 | Unit tests for the client hook. |

### Confidence Assessment
- **Confidence Score:** 95% 🟢
- **Notes:** The module is well-structured and follows clean architecture principles (Service/Repository pattern). The breach detection logic is robust, handling edge cases like null values and distinct technician targets. Polling at 60s is appropriate for the current scale.
