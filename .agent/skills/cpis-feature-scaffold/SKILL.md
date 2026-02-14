---
name: "cpis-feature-scaffold"
description: "Scaffolds a new CPIS feature with standard files (actions, service, types). Invoke when user asks to 'create feature X' or 'scaffold X'."
---

# CPIS Feature Scaffolder

This skill scaffolds a new feature module following the project's strict architecture:
`src/features/<feature-name>/{actions.ts, service.ts, types.ts, components/}`.

## Usage

1.  **Identify Feature Name:** Get the feature name from the user (e.g., "work-reports", "inventory").
2.  **Create Directory:** `src/features/<feature-name>` and `src/features/<feature-name>/components`.
3.  **Generate Files:** Create the following files with the templates below.

### 1. `actions.ts` Template
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getCurrentUser } from '@/features/auth/service';
import * as service from './service';

// --- Schemas ---
const createSchema = z.object({
  // TODO: Define schema
  name: z.string().min(1),
});

// --- Actions ---

export async function create<FeatureName>Action(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const data = Object.fromEntries(formData);
  const parsed = createSchema.safeParse(data);

  if (!parsed.success) {
    return { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors };
  }

  try {
    await service.create<FeatureName>(parsed.data);
  } catch (error) {
    console.error('[CPIS-ERROR] <FeatureName> Create:', error);
    return { error: 'Failed to create item' };
  }

  revalidatePath('/dashboard/<feature-name>');
  redirect('/dashboard/<feature-name>');
}
```

### 2. `service.ts` Template
```typescript
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

// --- Types ---
export type Create<FeatureName>Input = {
  name: string;
  // TODO: Add fields
};

// --- Service Methods ---

export async function create<FeatureName>(data: Create<FeatureName>Input) {
  // TODO: Implement logic
  // return await prisma.<model>.create({ data });
  throw new Error('Not implemented');
}

export async function get<FeatureName>List() {
  // return await prisma.<model>.findMany();
  return [];
}
```

### 3. `types.ts` Template
```typescript
// Define shared types here
export type <FeatureName>Status = 'active' | 'inactive';
```

## Execution Steps
1.  **Create Directories:**
    ```bash
    mkdir -p src/features/<feature-name>/components
    ```
2.  **Write Files:** Use the `Write` tool to create the 3 files using the templates above. Replace `<FeatureName>` with the PascalCase name (e.g., `WorkReport`) and `<feature-name>` with kebab-case (e.g., `work-reports`).
