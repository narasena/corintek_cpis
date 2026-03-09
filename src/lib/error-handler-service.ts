/**
 * Logger interface for dependency injection
 */
interface ILogger {
  error(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
}

/**
 * Error tracker interface for external services (Sentry, etc.)
 */
interface IErrorTracker {
  captureError(error: Error, context?: Record<string, unknown>): void;
}

/**
 * Error handler service configuration
 */
interface IErrorHandlerServiceConfig {
  /** Environment mode */
  environment: 'development' | 'production';
  /** Logger instance (injected) */
  logger: ILogger;
  /** Optional error tracker */
  tracker?: IErrorTracker;
}

/**
 * Processed error for UI consumption
 */
interface IProcessedError {
  /** User-friendly title */
  title: string;
  /** User-friendly message */
  message: string;
  /** Technical details (dev only) */
  details?: string;
  /** Error code if available */
  code?: string;
  /** Whether error allows retry */
  recoverable: boolean;
  /** Error digest for tracking */
  digest?: string;
}

/**
 * Indonesian error message translations
 */
const ERROR_TRANSLATIONS: Record<string, string> = {
  NetworkError: 'Gagal terhubung ke server. Periksa koneksi internet Anda.',
  TimeoutError: 'Waktu permintaan habis. Silakan coba lagi.',
  NotFoundError: 'Data tidak ditemukan.',
  PermissionError: 'Anda tidak memiliki izin untuk melakukan ini.',
  DEFAULT: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
};

/**
 * Service: ErrorHandlerService
 * Responsibility: Process errors for display and logging
 * Pattern: Class-based service with constructor injection
 */
export class ErrorHandlerService {
  private readonly config: IErrorHandlerServiceConfig;

  /**
   * Constructor with dependency injection
   * @param config - Service configuration with logger and tracker
   */
  constructor(config: IErrorHandlerServiceConfig) {
    this.config = config;
  }

  /**
   * Process error for display in UI
   * @param error - Raw error object
   * @returns Sanitized error safe for UI
   */
  processError(error: Error): IProcessedError {
    const isDev = this.config.environment === 'development';
    return {
      title: 'Terjadi kesalahan',
      message: this.getUserMessage(error),
      details: isDev ? error.stack : undefined,
      recoverable: this.isRecoverable(error),
      digest: (error as Error & { digest?: string }).digest,
    };
  }

  /**
   * Log error with context
   * @param error - Error to log
   * @param context - Additional context (String like 'Feature.Method' or Record object)
   */
  logError(
    error: Error,
    context: string | Record<string, unknown> = 'General'
  ): void {
    const contextName = typeof context === 'string' ? context : 'General';
    const contextData = typeof context === 'object' ? context : {};

    const formattedMessage = this.formatErrorMessage(error, contextName);
    this.config.logger.error(formattedMessage, {
      ...contextData,
      context: contextName,
      errorName: error.name,
      digest: (error as Error & { digest?: string }).digest,
    });
  }

  /**
   * Report error to external tracker
   * @param error - Error to report
   * @param context - Additional context
   */
  reportError(error: Error, context?: Record<string, unknown>): void {
    if (this.config.tracker) {
      this.config.tracker.captureError(error, context);
    }
  }

  /**
   * Determine if error is recoverable (allows retry)
   * @param error - Error to check
   * @returns True if error allows retry
   */
  isRecoverable(error: Error): boolean {
    const nonRecoverableTypes = ['SyntaxError', 'ReferenceError', 'TypeError'];
    return !nonRecoverableTypes.includes(error.name);
  }

  /**
   * Get user-friendly error message in Indonesian
   * @param error - Error to translate
   * @returns Localized user message
   */
  getUserMessage(error: Error): string {
    return ERROR_TRANSLATIONS[error.name] ?? ERROR_TRANSLATIONS.DEFAULT;
  }

  /**
   * Format error for logging with CPIS prefix
   * @param error - Error to format
   * @param context - Context where the error occurred
   * @returns Formatted error string
   */
  private formatErrorMessage(error: Error, context: string): string {
    return `[CPIS-ERROR] ${context}: ${error.name}: ${error.message}`;
  }
}

/**
 * Console logger implementation for default use
 */
export class ConsoleLogger implements ILogger {
  error(message: string, context?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.error(message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.warn(message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.info(message, context);
  }
}
