import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actionFactory } from './action-factory';
import { AuthenticationError } from './auth-helpers';
import { z } from 'zod';

// Mock dependencies
vi.mock('./auth-helpers', () => ({
  requireActor: vi.fn(),
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

const requireActorMock = vi.mocked(await import('./auth-helpers').then(m => m.requireActor));
const ensureAccessMock = vi.mocked(await import('./rbac').then(m => m.ensureAccess));

describe('actionFactory characterization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes handler successfully when all checks pass', async () => {
    const actor = { id: '1', role: 'ADMIN' };
    requireActorMock.mockResolvedValue(actor as any);
    
    const handler = vi.fn().mockResolvedValue('success-data');
    const action = actionFactory.protected(handler);

    const result = await action({ foo: 'bar' });

    expect(result).toEqual({ success: true, data: 'success-data' });
    expect(handler).toHaveBeenCalledWith({ input: { foo: 'bar' }, actor });
  });

  it('handles AuthenticationError correctly', async () => {
    requireActorMock.mockRejectedValue(new AuthenticationError());
    
    const handler = vi.fn();
    const action = actionFactory.protected(handler);

    const result = await action({});

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls ensureAccess when metadata is provided', async () => {
    const actor = { id: '1', role: 'TECHNICIAN' };
    requireActorMock.mockResolvedValue(actor as any);
    
    const action = actionFactory.protected(async () => 'ok', {
      metadata: { rbac: { resource: 'LOG_SHEETS' as any, capability: 'create' } }
    });

    await action({});

    expect(ensureAccessMock).toHaveBeenCalledWith('TECHNICIAN', 'LOG_SHEETS', 'create');
  });

  it('performs Zod validation and returns first error message', async () => {
    requireActorMock.mockResolvedValue({ role: 'ADMIN' } as any);
    
    const schema = z.object({
      email: z.string().email('Email tidak valid'),
    });
    
    const action = actionFactory.protected(async () => 'ok', { schema });

    const result = await action({ email: 'invalid' } as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Email tidak valid');
  });

  it('handles generic errors via err helper', async () => {
    requireActorMock.mockResolvedValue({ role: 'ADMIN' } as any);
    const handler = vi.fn().mockRejectedValue(new Error('DB Fail'));
    
    const action = actionFactory.protected(handler);
    const result = await action({});

    expect(result.success).toBe(false);
    expect(result.error).toBe('Gagal');
  });
});
