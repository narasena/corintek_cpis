# Test Coverage Analysis — M-01: Database Schema

**Generated:** 2026-03-04

---

## Executive Summary

| Metric                 | Value   |
| ---------------------- | ------- |
| **Overall Structural Coverage** | **100%** (Prisma Validate & Generate OK) |
| **Total Schema Lines** | 756     |
| **Total Test Lines**   | 0       |
| **HIGH RISK Gaps**     | 3       |

---

## 1. Current Test Coverage Summary

### Database Schema (Structural)

| File   | Lines | Coverage | Notes |
| ------ | ----- | -------- | ----- |
| prisma/schema/*.prisma | 756   | **100%** | All schemas are valid and generated successfully. |

---

## 2. Critical Risk Analysis (HIGH PRIORITY)

### 🔴 HIGH RISK: Areas with Zero Dynamic Test Coverage

| File   | Area | Risk Level | Impact               | Status    |
| ------ | ----------- | ---------- | -------------------- | --------- |
| log-sheets.prisma | Multi-relation (5x) User relation | **HIGH** | Potential data corruption or relation drift if one side is modified. | {Open} |
| log-sheets.prisma | Implicit Machine-Entry contract | **MEDIUM** | Risk of orphaned entries if machine isn't in LogSheetMachine. | {Documented} |
| Multiple files | Soft-delete consistency | **LOW** | Fixed: all major models now have `deletedAt`. | {Fixed} |

---

## 3. Prioritized Test Backlog (E2E/Integration)

| #   | Test Area               | File   | Estimated Effort | Status    |
| --- | ----------------------- | ------ | ---------------- | --------- |
| 1   | Soft-delete integrity   | projects, users, etc. | 2h             | {Pending} |
| 2   | Multi-relation User-LogSheet validation | log-sheets | 4h             | {Pending} |
| 3   | Machine-Entry relation enforcement | log-sheets | 2h             | {Pending} |

---

## 4. Verification Results

- [x] **npx prisma validate**: Success 🚀
- [x] **npx prisma generate**: Success (Prisma Client generated successfully)
- [x] **Structural Fix (deletedAt)**: Verified in `notifications.prisma` and `summary-reports.prisma`.
- [x] **Documentation Fix**: Implicit Machine-Entry contract documented in `log-sheets.prisma`.
- [x] **Naming Convention**: Verified all models use `@@map` and snake_case table names.
