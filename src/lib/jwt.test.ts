import { vi } from 'vitest';

vi.hoisted(() => {
  // Set environment variable BEFORE any imports that use it at top level
  process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough-for-hs256';
});

import { describe, it, expect, beforeEach } from 'vitest';
import { generateToken, verifyToken, decodeToken, JWTError } from './jwt';
import * as jose from 'jose';

// We need to mock jose because we can't spy on ESM exports
vi.mock('jose', async (importOriginal) => {
  const actual = await importOriginal<typeof jose>();
  return {
    ...actual,
    jwtVerify: vi.fn(),
  };
});

describe('JWT Utilities (Characterization)', () => {
  const mockPayload = { id: '550e8400-e29b-41d4-a716-446655440000', email: 'test@test.com', role: 'ADMIN' as any };

  beforeEach(async () => {
    // Reset mock to original behavior by default for every test
    vi.mocked(jose.jwtVerify).mockImplementation(async (token, secret) => {
      const { jwtVerify } = await vi.importActual<typeof jose>('jose');
      return jwtVerify(token, secret);
    });
  });

  it('should generate and verify a valid token', async () => {
    const token = await generateToken(mockPayload);
    expect(token).toBeDefined();

    const result = await verifyToken(token);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject(mockPayload);
    }
  });

  it('should return failure for tampered tokens', async () => {
    const result = await verifyToken('invalid.token.here');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Token tidak valid');
    }
  });

  it('should return failure when token is expired', async () => {
    vi.mocked(jose.jwtVerify).mockRejectedValue(
      new jose.errors.JWTExpired('expired', {
        payload: {},
        protectedHeader: { alg: 'HS256' },
      })
    );

    const result = await verifyToken('some.token');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Sesi telah berakhir');
    }
  });

  it('should return failure for malformed payload', async () => {
    // @ts-ignore - intentional invalid payload
    const token = await generateToken({ email: 'no-id' } as any);

    const result = await verifyToken(token);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Data token tidak valid');
    }
  });

  it('should decode a token without verification', async () => {
    const token = await generateToken(mockPayload);
    const decoded = decodeToken(token);
    expect(decoded).toMatchObject(mockPayload);
  });
});
