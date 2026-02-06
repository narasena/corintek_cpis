## 3. Git & Branching Strategy
Before even writing a single line of code check this table first and proceed as instructed in this table.
| Condition | Action | Naming |
| :--- | :--- | :--- |
| Task matches current branch | **Continue** | N/A |
| New Feature | **New Branch** | `feat/<domain>/<action>` |
| Bug Fix | **New Branch** | `fix/<domain>/<issue>` |
| Refactor | **New Branch** | `refactor/<scope>` |
| Current is `main`/`dev`/`stage` | **STOP** | **New Branch Required** |


> **Atomic Commits:** One logical change = one commit. Format: `feat(auth): add zod schema`.