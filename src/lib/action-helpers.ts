export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function err(error: unknown, fallback: string): ActionResult<never> {
  console.error('[CPIS-ERROR]', error);
  return {
    success: false,
    error: error instanceof Error ? error.message : fallback,
  };
}
