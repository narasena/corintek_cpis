/**
 * CPIS Structured Logger
 *
 * Centralizes the [CPIS-<TYPE>] logging convention mandated in CONVENTIONS.md.
 * Ensures consistent formatting and ease of log aggregation.
 */

type TLogContext = Record<string, unknown>;

/**
 * Formats key-value pairs into a standardized string: | key: value | key2: value2
 */
function formatContext(context?: TLogContext): string {
  if (!context || Object.keys(context).length === 0) return '';

  return (
    ' | ' +
    Object.entries(context)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' | ')
  );
}

export const logger = {
  /**
   * Log an error using [CPIS-ERROR] prefix
   */
  error: (
    feature: string,
    method: string,
    message: string,
    context?: TLogContext
  ) => {
    console.error(
      `[CPIS-ERROR] ${feature}.${method}: ${message}${formatContext(context)}`
    );
  },

  /**
   * Log security/authentication events using [CPIS-AUTH] prefix
   */
  auth: (
    feature: string,
    method: string,
    message: string,
    context?: TLogContext
  ) => {
    console.info(
      `[CPIS-AUTH] ${feature}.${method}: ${message}${formatContext(context)}`
    );
  },

  /**
   * Log general system information using [CPIS-SYSTEM] prefix
   */
  info: (
    feature: string,
    method: string,
    message: string,
    context?: TLogContext
  ) => {
    console.info(
      `[CPIS-SYSTEM] ${feature}.${method}: ${message}${formatContext(context)}`
    );
  },

  /**
   * Log warnings using [CPIS-WARN] prefix
   */
  warn: (
    feature: string,
    method: string,
    message: string,
    context?: TLogContext
  ) => {
    console.warn(
      `[CPIS-WARN] ${feature}.${method}: ${message}${formatContext(context)}`
    );
  },
};
