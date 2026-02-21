# E2E Tests for Log-Sheet Module

End-to-end tests covering critical user flows through the full application stack.

## Prerequisites

1. **Database**: Use existing development database (no separate test DB needed)
2. **Test Users**: Ensure users exist with credentials matching `.env.e2e.local`
3. **Project Data**: At least one project with machines and parameters configured

## Setup

1. Copy environment template:

   ```bash
   cp .env.e2e.example .env.e2e.local
   ```

2. Fill in credentials for test users:
   - `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` - Admin user
   - `E2E_TECHNICIAN_EMAIL` / `E2E_TECHNICIAN_PASSWORD` - Technician user
   - `E2E_PROJECT_ID` - UUID of existing project for tests

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI for debugging
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug specific test
npm run test:e2e:debug
```

## Test Scenarios

| File                          | Scenario            | Description                                             |
| ----------------------------- | ------------------- | ------------------------------------------------------- |
| `happy-path.spec.ts`          | Happy Path          | Technician creates, fills, signs, and submits log sheet |
| `happy-path.spec.ts`          | Draft Resume        | Save incomplete draft and continue later                |
| `draft-flow.spec.ts`          | Machine Selection   | Dynamic add/remove active machines                      |
| `draft-flow.spec.ts`          | Notes               | Add notes to log sheet                                  |
| `draft-flow.spec.ts`          | Chemical Usage      | Enter chemical usage data                               |
| `validation-recovery.spec.ts` | Missing Signatures  | Validation error when submitting without signatures     |
| `validation-recovery.spec.ts` | Out-of-Range Values | Visual warning for values outside limits                |
| `validation-recovery.spec.ts` | Required Fields     | Validation error for missing required entries           |
| `validation-recovery.spec.ts` | Error Recovery      | Fix validation errors and retry submission              |
| `admin-override.spec.ts`      | Admin Unlock        | Admin can edit locked/submitted sheets                  |
| `admin-override.spec.ts`      | Approval            | Admin can approve submitted log sheets                  |
| `admin-override.spec.ts`      | RBAC                | Non-admin cannot unlock sheets                          |
| `admin-override.spec.ts`      | Full Lock           | Approved sheets are fully locked                        |

## Architecture

```
src/__tests__/e2e/
├── auth/                    # Authentication setup files
│   ├── admin.setup.ts       # Admin login → storage state
│   ├── technician.setup.ts  # Technician login → storage state
│   └── client-pic.setup.ts  # Client PIC login → storage state
├── fixtures/
│   ├── log-sheet-fixture.ts # Test data factories & helpers
│   └── signature-fixture.ts # Pre-generated signature base64
├── helpers/
│   └── form-helpers.ts      # Generic form utilities
└── log-sheet/
    ├── happy-path.spec.ts   # Critical: Full submit flow
    ├── draft-flow.spec.ts   # Common: Save draft scenarios
    ├── validation-recovery.spec.ts # Error handling
    └── admin-override.spec.ts # Admin operations
```

## Test Data Strategy

- **Each test creates its own log sheet** - Ensures isolation and reproducibility
- **Uses existing DB data** - Projects, machines, parameters from development DB
- **Pre-generated signatures** - Avoids complex canvas interaction
- **Storage state auth** - Faster than logging in every test

## Debugging

1. Use `npm run test:e2e:ui` for interactive debugging
2. Check `test-results/` for screenshots and videos on failure
3. Use `page.pause()` to pause test execution
4. Check `playwright-report/` for HTML report after run

## Maintenance Notes

- Tests are designed to be resilient to minor UI changes
- Uses role-based selectors (byRole) over CSS selectors where possible
- Skip conditions handle missing test data gracefully
