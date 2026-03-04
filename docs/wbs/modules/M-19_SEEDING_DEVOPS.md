# WBS Module Scan: M-19 — Seeding & DevOps

## EP-016: Infrastructure & Foundation (DevOps & Quality)

| ID | Parent | Type | Item | O | L | P | E |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| **EP-016** | — | **Epic** | **Infrastructure & Foundation** | **—** | **—** | **—** | **Σ** |
| **US-016-004** | EP-016 | **User Story** | **As a developer, I want automated seeding and quality gates to maintain data consistency and code standards** | **—** | **—** | **—** | **Σ** |
| AC-016-004 | US-016-004 | Acceptance Criteria | Automated seeding scripts and git hooks for linting/commit validation | — | — | — | Σ |
| **WP-016-004** | AC-016-004 | **Work Package** | **DevOps (Data & Quality)** | **—** | **—** | **—** | **Σ** |
| TK-016-028 | WP-016-004 | Task | Database Seeding: Implementation of `seed.ts` and `seed-data.ts` for multi-domain upserts | 2 | 4 | 7 | 4.17 |
| TK-016-029 | WP-016-004 | Task | Seed Export/Import: Orchestration script `seed-export.ts` for automated data portability | 2 | 3 | 5 | 3.17 |
| TK-016-030 | WP-016-004 | Task | Husky & lint-staged: Pre-commit hook integration with `package.json` scripts | 1 | 1.5 | 3 | 1.67 |
| TK-016-031 | WP-016-004 | Task | Commitlint: Configuration and enforcement of conventional commit standards | 0.5 | 1 | 2 | 1.08 |
| TK-016-032 | WP-016-004 | Task | ESLint & Prettier: Flat config (`eslint.config.mjs`) for strict TS/React rules and formatting | 1.5 | 3 | 5 | 3.08 |
| TK-016-033 | WP-016-004 | Task | Environment Configuration: Seeding documentation and developer guides (`SEED_README.md`) | 0.5 | 1 | 2 | 1.08 |

### File Manifest — M-19: Seeding & DevOps

| # | File | Lines | Functions | Covered By | Complexity |
| :--- | :--- | ---: | ---: | :--- | :--- |
| 1 | `prisma/seed.ts` | ~330 | 1 | TK-016-028 | Standard |
| 2 | `prisma/seed-data.ts` | ~60,000 | 1 | TK-016-028 | ⚠️ Deceptively complex (Data volume) |
| 3 | `prisma/seed-export.ts` | ~150 | 3 | TK-016-029 | 🔗 Integration-heavy |
| 4 | `prisma/SEED_README.md` | ~130 | - | TK-016-033 | Standard |
| 5 | `eslint.config.mjs` | ~100 | - | TK-016-032 | 📋 Business rules |
| 6 | `.prettierrc` | 10 | - | TK-016-032 | Standard |
| 7 | `.lintstagedrc` | 5 | - | TK-016-030 | Standard |
| 8 | `commitlint.config.js` | 25 | - | TK-016-031 | Standard |
| 9 | `.husky/commit-msg` | 10 | - | TK-016-030 | Standard |
| 10 | `package.json` | 150 | - | TK-016-030 | 🔗 Integration-heavy |

### Confidence: 98%

**Justification:**
- Files scanned: 10/10 (100%)
- Functions covered: 5/5
- Cross-ref vs fast scan: Matched all 5 fast-scan items, added 1 specific documentation task (TK-016-033).

**Status:** 🟢 High Confidence
