---
alwaysApply: true
description: Standardized error handling and logging for Server Actions. Invoke when writing try/catch blocks.
---
# Logging & Error Protocol

> **GOAL:** Eliminate "Silent Failures" in Server Actions.

## 1. The Standard Pattern
Every Server Action (`actions.ts`) MUST follow this `try/catch` pattern:

```typescript
export async function myAction(formData: FormData) {
  // 1. Validate
  // ...

  // 2. Execute
  try {
    await service.doSomething(data);
  } catch (error) {
    // 3. LOG (Server-Side)
    console.error('[CPIS-ERROR] FeatureName.ActionName:', error);

    // 4. FEEDBACK (Client-Side)
    // Return a structured error object that the UI can display as a Toast
    return {
      success: false,
      message: 'Failed to perform action. Please try again.',
      // Optional: detailed error for dev mode only
      // debug: error instanceof Error ? error.message : String(error)
    };
  }

  // 5. Success
  revalidatePath('/path');
  return { success: true };
}
```

## 2. Rules
1.  **Prefix Logs:** Always use `[CPIS-ERROR]` so we can `grep` logs easily.
2.  **Context:** Include `<Feature>.<Action>` in the log message.
3.  **No Silent Swallowing:** Never use empty `catch {}`.
4.  **User-Friendly Messages:** Never show raw SQL errors to the user. Use generic "Failed to..." messages.

## 3. Global Error Boundary
*   Ensure `error.tsx` exists in the root `app/` and major sub-routes to catch React rendering errors.
