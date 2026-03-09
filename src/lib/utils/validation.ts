import { z } from 'zod';

/**
 * Type guard to check if an unknown error is a Zod validation error
 */
export function isZodError(error: unknown): error is z.ZodError {
  return (
    error instanceof z.ZodError ||
    (error instanceof Error && error.name === 'ZodError') ||
    (error !== null && typeof error === 'object' && 'issues' in error)
  );
}

/**
 * Formats a ZodError into a flat, human-readable string
 * Example: "email: Invalid format; age: Too young"
 * 
 * @param error - The Zod error object
 * @param fallback - Default message if no issues are present
 */
export function formatZodError(
  error: z.ZodError,
  fallback: string = 'Input tidak valid'
): string {
  const issues = error.issues || (error as any).errors;
  if (!issues || issues.length === 0) return fallback;

  return issues
    .map((issue: any) => {
      const path = issue.path?.join('.');
      const message = issue.message;
      return path ? `${path}: ${message}` : message;
    })
    .join('; ');
}
