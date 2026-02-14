---
alwaysApply: true
description: Standardized error handling for Server Actions.
---
# Coding Standards: Logging & Errors

## The Pattern
**GOAL:** Eliminate "Silent Failures".
Every Server Action MUST use this pattern:

```typescript
export async function action(formData: FormData) {
  // 1. Validate
  const data = parse(formData);

  // 2. Execute
  try {
    await service.do(data);
  } catch (error) {
    // 3. LOG (Server-Side)
    console.error('[CPIS-ERROR] Feature.Action:', error);

    // 4. FEEDBACK (Client-Side)
    return {
      success: false,
      message: 'Action failed. Try again.',
    };
  }

  // 5. Success
  revalidatePath('/path');
  return { success: true };
}
```

## Rules
1.  **Prefix:** `[CPIS-ERROR]` required.
2.  **Context:** `<Feature>.<Action>`.
3.  **No Empty Catch:** Forbidden.
