## 3. Git & Branching Strategy
| Condition | Action | Naming |
| :--- | :--- | :--- |
| Task matches current branch | **Continue** | N/A |
| New Feature | **New Branch** | `feat/<domain>/<action>` |
| Bug Fix | **New Branch** | `fix/<domain>/<issue>` |
| Refactor | **New Branch** | `refactor/<scope>` |
| Current is `main`/`dev`/`stage` | **STOP** | **New Branch Required** |


> **Atomic Commits:** One logical change = one commit. Format: `feat(auth): add zod schema`.