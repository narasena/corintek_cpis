import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorHandlerService, ConsoleLogger } from './error-handler-service';

describe('ErrorHandlerService', () => {
  const mockLogger = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  };

  const mockTracker = {
    captureError: vi.fn(),
  };

  const createService = (env: 'development' | 'production' = 'production') =>
    new ErrorHandlerService({
      environment: env,
      logger: mockLogger,
      tracker: mockTracker,
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processError', () => {
    it('returns processed error with default title', () => {
      const service = createService();
      const error = new Error('Something went wrong');

      const result = service.processError(error);

      expect(result.title).toBe('Terjadi kesalahan');
      expect(result.message).toBeTruthy();
      expect(result.recoverable).toBeDefined();
    });

    it('extracts digest from error', () => {
      const service = createService();
      const error = new Error('Test') as Error & { digest?: string };
      error.digest = 'abc123';

      const result = service.processError(error);

      expect(result.digest).toBe('abc123');
    });

    it('includes details in development mode', () => {
      const service = createService('development');
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at Test.method';

      const result = service.processError(error);

      expect(result.details).toBeDefined();
    });

    it('excludes details in production mode', () => {
      const service = createService('production');
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at Test.method';

      const result = service.processError(error);

      expect(result.details).toBeUndefined();
    });

    it('determines recoverability correctly', () => {
      const service = createService();

      const networkError = new Error('Network failed');
      networkError.name = 'NetworkError';

      const syntaxError = new Error('Invalid syntax');
      syntaxError.name = 'SyntaxError';

      expect(service.processError(networkError).recoverable).toBe(true);
      expect(service.processError(syntaxError).recoverable).toBe(false);
    });
  });

  describe('logError', () => {
    it('logs error with CPIS prefix', () => {
      const service = createService();
      const error = new Error('Test error');

      service.logError(error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('[CPIS-ERROR]'),
        expect.any(Object)
      );
    });

    it('includes error name and digest in context', () => {
      const service = createService();
      const error = new Error('Test error') as Error & { digest?: string };
      error.name = 'CustomError';
      error.digest = 'xyz789';

      service.logError(error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          errorName: 'CustomError',
          digest: 'xyz789',
        })
      );
    });

    it('includes additional context', () => {
      const service = createService();
      const error = new Error('Test');
      const context = { userId: '123', action: 'save' };

      service.logError(error, context);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining(context)
      );
    });
  });

  describe('reportError', () => {
    it('reports to tracker when configured', () => {
      const service = createService();
      const error = new Error('Test');

      service.reportError(error);

      expect(mockTracker.captureError).toHaveBeenCalledWith(error, undefined);
    });

    it('includes context when reporting', () => {
      const service = createService();
      const error = new Error('Test');
      const context = { userId: '123' };

      service.reportError(error, context);

      expect(mockTracker.captureError).toHaveBeenCalledWith(error, context);
    });

    it('does not throw when tracker is undefined', () => {
      const service = new ErrorHandlerService({
        environment: 'production',
        logger: mockLogger,
      });

      const error = new Error('Test');

      expect(() => service.reportError(error)).not.toThrow();
    });
  });

  describe('isRecoverable', () => {
    it('returns true for network errors', () => {
      const service = createService();
      const error = new Error('Network failed');
      error.name = 'NetworkError';

      expect(service.isRecoverable(error)).toBe(true);
    });

    it('returns true for timeout errors', () => {
      const service = createService();
      const error = new Error('Timeout');
      error.name = 'TimeoutError';

      expect(service.isRecoverable(error)).toBe(true);
    });

    it('returns false for syntax errors', () => {
      const service = createService();
      const error = new Error('Invalid syntax');
      error.name = 'SyntaxError';

      expect(service.isRecoverable(error)).toBe(false);
    });

    it('returns false for reference errors', () => {
      const service = createService();
      const error = new Error('Not defined');
      error.name = 'ReferenceError';

      expect(service.isRecoverable(error)).toBe(false);
    });

    it('returns false for type errors', () => {
      const service = createService();
      const error = new Error('Cannot read property');
      error.name = 'TypeError';

      expect(service.isRecoverable(error)).toBe(false);
    });
  });

  describe('getUserMessage', () => {
    it('returns Indonesian message for NetworkError', () => {
      const service = createService();
      const error = new Error('Failed');
      error.name = 'NetworkError';

      const message = service.getUserMessage(error);

      expect(message).toContain('server');
      expect(message).toContain('koneksi');
    });

    it('returns Indonesian message for TimeoutError', () => {
      const service = createService();
      const error = new Error('Timeout');
      error.name = 'TimeoutError';

      const message = service.getUserMessage(error);

      expect(message).toContain('Waktu');
      expect(message).toContain('habis');
    });

    it('returns Indonesian message for NotFoundError', () => {
      const service = createService();
      const error = new Error('Not found');
      error.name = 'NotFoundError';

      const message = service.getUserMessage(error);

      expect(message).toContain('tidak ditemukan');
    });

    it('returns Indonesian message for PermissionError', () => {
      const service = createService();
      const error = new Error('Forbidden');
      error.name = 'PermissionError';

      const message = service.getUserMessage(error);

      expect(message).toContain('izin');
    });

    it('returns generic message for unknown error types', () => {
      const service = createService();
      const error = new Error('Unknown');
      error.name = 'UnknownError';

      const message = service.getUserMessage(error);

      expect(message).toContain('kesalahan');
    });
  });
});

describe('ConsoleLogger', () => {
  it('logs errors to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logger = new ConsoleLogger();

    logger.error('Test error', { detail: 'info' });

    expect(consoleSpy).toHaveBeenCalledWith('Test error', { detail: 'info' });
    consoleSpy.mockRestore();
  });

  it('logs warnings to console', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logger = new ConsoleLogger();

    logger.warn('Test warning');

    expect(consoleSpy).toHaveBeenCalledWith('Test warning', undefined);
    consoleSpy.mockRestore();
  });

  it('logs info to console', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = new ConsoleLogger();

    logger.info('Test info');

    expect(consoleSpy).toHaveBeenCalledWith('Test info', undefined);
    consoleSpy.mockRestore();
  });
});
