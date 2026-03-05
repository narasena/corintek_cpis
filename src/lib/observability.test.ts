/**
 * @fileoverview Unit tests for observability utilities
 * @module lib/observability.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LogLevel, logPagination, logPaginationError } from './observability';

describe('logPagination', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('should log structured pagination data', () => {
    logPagination(
      LogLevel.INFO,
      'TestService',
      'testMethod',
      Date.now() - 100,
      {
        total: 50,
        page: 1,
        limit: 10,
      }
    );

    expect(logSpy).toHaveBeenCalledWith(
      '[PAGINATION]',
      expect.stringContaining('"service":"TestService"')
    );
    const logged = JSON.parse(logSpy.mock.calls[0][1]);
    expect(logged.duration).toBe(100);
    expect(logged.total).toBe(50);
  });

  it('should calculate duration correctly', () => {
    const start = Date.now();
    vi.advanceTimersByTime(250);

    logPagination(LogLevel.INFO, 'TestService', 'testMethod', start);

    const logged = JSON.parse(logSpy.mock.calls[0][1]);
    expect(logged.duration).toBe(250);
  });

  it('should work without optional meta', () => {
    logPagination(LogLevel.INFO, 'TestService', 'testMethod', Date.now() - 50);

    expect(logSpy).toHaveBeenCalled();
    const logged = JSON.parse(logSpy.mock.calls[0][1]);
    expect(logged.service).toBe('TestService');
    expect(logged.total).toBeUndefined();
  });

  it('should not log when level is below threshold', () => {
    logPagination(LogLevel.DEBUG, 'TestService', 'testMethod', Date.now() - 50);
    expect(logSpy).not.toHaveBeenCalled();
  });
});

describe('logPaginationError', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('should log structured error data', () => {
    const error = new Error('Database timeout');
    logPaginationError('TestService', 'testMethod', Date.now() - 500, error);

    expect(errorSpy).toHaveBeenCalledWith(
      '[PAGINATION]',
      expect.stringContaining('Database timeout')
    );
    const logged = JSON.parse(errorSpy.mock.calls[0][1]);
    expect(logged.duration).toBe(500);
    expect(logged.level).toBe('ERROR');
  });

  it('should capture error message correctly', () => {
    const start = Date.now();
    vi.advanceTimersByTime(100);
    logPaginationError(
      'Service',
      'Method',
      start,
      new Error('Connection failed')
    );

    const logged = JSON.parse(errorSpy.mock.calls[0][1]);
    expect(logged.error).toBe('Connection failed');
    expect(logged.duration).toBe(100);
  });
});
