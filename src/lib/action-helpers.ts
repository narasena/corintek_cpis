/**
 * Standard action response type for Server Actions
 * Use this as the return type for all server actions
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Alias for ActionResult - maintains backward compatibility
 * Prefer ActionResult for new code
 */
export type TActionResponse<T = unknown> = ActionResult<T>;

/**
 * Create a successful action response
 */
export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

/**
 * Create a failed action response with error logging
 */
export function err(error: unknown, fallback: string): ActionResult<never> {
  console.error('[CPIS-ERROR]', error);
  return {
    success: false,
    error: error instanceof Error ? error.message : fallback,
  };
}

/**
 * Create an unauthorized response
 */
export function unauthorized(): ActionResult<never> {
  return { success: false, error: 'Unauthorized' };
}
