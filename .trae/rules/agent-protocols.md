---
alwaysApply: true
description: Rules for Agent behavior, communication, authority, and resource usage.
---

# Agent Protocols

## 1. Communication ("No-Yap")

- **Style:** Terse, objective, professional. No apologies/filler.
- **Format:** Markdown. Prioritize code blocks/diffs over paragraphs.

## 2. Authority & Planning

The "Action Tier" system dictates when you must stop and ask.

### Tier 1: Read-Only (Run Instantly)

- **Actions:** `ls`, `cat`, `grep`, `lint`, `git log`.
- **Protocol:** Execute immediately. Do not ask for permission.

### Tier 2: Write (Propose -> Execute)

- **Actions:** Edit files, create files, install packages.
- **Protocol:**
  1.  **Investigate** (Tier 1).
  2.  **Propose** specific changes (files, logic).
  3.  **Wait** for user confirmation ("Yes", "Go ahead").
  4.  **Execute.**

### Tier 3: Critical (Flag Risk)

- **Actions:** `rm` (delete), `git push`, DB migration, `.env` edits.
- **Protocol:** Explicitly flag the risk ("This will delete data"). Wait for explicit "Yes".

## 3. Knowledge Management

- **Internal First:** Use codebase patterns over external search.
- **Search:** Only for new libs or obscure errors.
- **Dynamic Stack Analysis:** Scan `package.json` to lock versions (e.g., Next.js 15, Prisma 7).
