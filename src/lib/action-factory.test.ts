import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { createActionFactory } from './action-factory';
import { AuthenticationError } from './auth-helpers';
import { z } from 'zod';

// Mock dependencies
vi.mock('./auth-helpers', () => ({
  AuthenticationError: class extends Error {
    constructor() {
      super('Unauthorized');
      this.name = 'AuthenticationError';
    }
  },
}));

vi.mock('./rbac', () => ({
  ensureAccess: vi.fn(),
}));

vi.mock('./action-helpers', () => ({
  unauthorized: vi.fn(() => ({ success: false, error: 'Unauthorized' })),
  err: vi.fn((_e, msg) => ({ success: false, error: msg || 'Error' })),
}));

const ensureAccessMock = vi.mocked(
  await import('./rbac').then(m => m.ensureAccess)
);

const MOCK_ERROR_CONFIG = {
  sessionExpired: 'SESSION_EXPIRED',
  inputInvalid: 'INPUT_INVALID',
  genericError: 'GENERIC_ERROR',
};

const authenticateMock = vi.fn();
const actionFactory = createActionFactory(authenticateMock, MOCK_ERROR_CONFIG);

describe('actionFactory characterization', () => {
  beforeAll(() => {
    vi.stubEnv('DATABASE_URL', 'postgresql://user:password@localhost:5432/db');
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes handler successfully when all checks pass', async () => {
    const actor = { id: '1', role: 'ADMIN' };
    authenticateMock.mockResolvedValue(actor as any);

    const handler = vi.fn().mockResolvedValue('success-data');
    const action = actionFactory.protected(handler);

    const result = await action({ foo: 'bar' });

    expect(result).toEqual({ success: true, data: 'success-data' });
    expect(handler).toHaveBeenCalledWith({ input: { foo: 'bar' }, actor });
  });

  it('handles AuthenticationError correctly', async () => {
    authenticateMock.mockRejectedValue(new AuthenticationError());

    const handler = vi.fn();
    const action = actionFactory.protected(handler);

    const result = await action({});

    expect(result).toEqual({
      success: false,
      error: MOCK_ERROR_CONFIG.sessionExpired,
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls ensureAccess when metadata is provided', async () => {
    const actor = { id: '1', role: 'TECHNICIAN' };
    authenticateMock.mockResolvedValue(actor as any);

    const action = actionFactory.protected(async () => 'ok', {
      metadata: {
        rbac: { resource: 'LOG_SHEETS' as any, capability: 'create' },
      },
    });

    await action({});

    expect(ensureAccessMock).toHaveBeenCalledWith(
      'TECHNICIAN',
      'LOG_SHEETS',
      'create'
    );
  });

  it('performs Zod validation and returns first error message', async () => {
    authenticateMock.mockResolvedValue({ role: 'ADMIN' } as any);

    const schema = z.object({
      email: z.string().email('Email tidak valid'),
    });

    const action = actionFactory.protected(async () => 'ok', { schema });

    const result = await action({ email: 'invalid' } as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('email: Email tidak valid');
  });

  it('formats multiple Zod errors into a single string', async () => {
    authenticateMock.mockResolvedValue({ role: 'ADMIN' } as any);

    const schema = z.object({
      email: z.string().email('Email invalid'),
      age: z.number().min(18, 'Must be adult'),
    });

    const action = actionFactory.protected(async () => 'ok', { schema });

    const result = await action({ email: 'bad', age: 10 } as any);

    expect(result.success).toBe(false);
    expect(result.error).toBe('email: Email invalid; age: Must be adult');
  });

  it('handles generic errors via err helper', async () => {
    authenticateMock.mockResolvedValue({ role: 'ADMIN' } as any);
    const handler = vi.fn().mockRejectedValue(new Error('DB Fail'));

    const action = actionFactory.protected(handler);
    const result = await action({});

    expect(result.success).toBe(false);
    expect(result.error).toBe(MOCK_ERROR_CONFIG.genericError);
  });
});
