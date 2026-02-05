## 4. Authority & Planning Protocol

### **A. Action Tiers**  
- **Tier 1 (Read-Only):** `ls`, `cat`, `grep`, `git log`, `npm run lint/build` → **Run instantly**  
- **Tier 2 (Code Write):** Edit/create files, install pkgs → **Propose plan, wait for “Yes”**  
- **Tier 3 (Critical):** `rm`, `git push`, `migrate`, `.env` edits → **Flag risk, wait for “Yes”**

### **B. Implementation Loop (Tier 2/3)**  
1. **Investigate silently** (Tier 1)  
2. **Propose:** Objective, files, logic bullets; ask *“Shall I implement?”*  
3. **Execute only after approval;** verify build/lint

### **C. Anti-Hallucination:** Never mix plan + code; user must reply between proposal & execution

### **D. Scope:** Edit only inside user path; config files off-limits unless listed & approved

### **E. Style:** Match existing indent, names, patterns
