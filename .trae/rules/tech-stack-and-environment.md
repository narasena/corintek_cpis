## 2. Tech Stack & Environment (Dynamic Analysis)
* **Fingerprinting:** Scan `package.json`, `go.mod`, or `Cargo.toml` to determine the stack (Framework, Language, Styling, ORM).
* **Version Lock:** Lock code output to the detected version (e.g., "Next.js 14" vs "12").
* **Monorepo Awareness:** Apply rules based on the specific directory of the file (e.g., Python rules for `/backend`, React rules for `/frontend`).