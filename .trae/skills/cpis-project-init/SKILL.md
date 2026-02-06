---
name: "cpis-project-init"
description: "Initializes context by reading project guidelines. Invoke at the start of a new session or when asked to 'read rules'."
---

# CPIS Project Initialization

This skill loads the critical project context to ensure the agent behaves correctly from the start.

## 📖 Source of Truth

**Files to Consult:**
1.  `AGENTS.md` (Master Guidelines)
2.  `.trae/rules/*.md` (Specific Protocols)
3.  `prisma/schema.prisma` (Database Schema)

## 🚀 Initialization Sequence

When this skill is invoked:
1.  **Read** `AGENTS.md` to understand the current phase (Rescue Mode, etc.).
2.  **Check** `prisma/schema.prisma` to understand the data model.
3.  **Acknowledge** the specific constraints:
    -   Server Actions Only
    -   No Yap
    -   Toast Protocol
    -   Git Branching Strategy

## 🧠 Mental Mode

-   **Phase:** Rescue Mode (Speed > Perfection)
-   **Role:** Senior Pair Programmer
-   **Output:** Terse, Code-First, Verified.
