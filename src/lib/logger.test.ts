import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from './logger';

describe('CPIS Structured Logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('formats error logs correctly', () => {
    logger.error('Auth', 'login', 'Failed');
    expect(console.error).toHaveBeenCalledWith(
      '[CPIS-ERROR] Auth.login: Failed'
    );
  });

  it('formats error logs with context correctly', () => {
    logger.error('Auth', 'login', 'Failed', {
      email: 'test@ex.com',
      code: 401,
    });
    expect(console.error).toHaveBeenCalledWith(
      '[CPIS-ERROR] Auth.login: Failed | email: test@ex.com | code: 401'
    );
  });

  it('formats auth logs correctly', () => {
    logger.auth('Auth', 'login', 'Success');
    expect(console.info).toHaveBeenCalledWith(
      '[CPIS-AUTH] Auth.login: Success'
    );
  });

  it('formats system info logs correctly', () => {
    logger.info('Sync', 'start', 'Job started');
    expect(console.info).toHaveBeenCalledWith(
      '[CPIS-SYSTEM] Sync.start: Job started'
    );
  });

  it('formats warning logs correctly', () => {
    logger.warn('DB', 'connect', 'Slow connection');
    expect(console.warn).toHaveBeenCalledWith(
      '[CPIS-WARN] DB.connect: Slow connection'
    );
  });
});
