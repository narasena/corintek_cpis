import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
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

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough-for-hs256';
  });

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
    
    const decoded = await verifyToken(token);
    expect(decoded).toMatchObject(mockPayload);
  });

  it('should throw JWTError with code INVALID for tampered tokens', async () => {
    const err = await verifyToken('invalid.token.here').catch(e => e);
    expect(err).toBeInstanceOf(JWTError);
    expect(err.code).toBe('INVALID');
    expect(err.message).toContain('Token tidak valid');
  });

  it('should throw JWTError with code EXPIRED when token is expired', async () => {
    vi.mocked(jose.jwtVerify).mockRejectedValue(
      new jose.errors.JWTExpired('expired', { payload: {}, protectedHeader: { alg: 'HS256' } })
    );

    const err = await verifyToken('some.token').catch(e => e);
    expect(err.code).toBe('EXPIRED');
    expect(err.message).toContain('Sesi telah berakhir');
  });

  it('should throw JWTError with code VALIDATION_FAILED for malformed payload', async () => {
    // @ts-ignore - intentional invalid payload
    const token = await generateToken({ email: 'no-id' } as any);
    
    const err = await verifyToken(token).catch(e => e);
    expect(err.code).toBe('VALIDATION_FAILED');
    expect(err.message).toContain('Data token tidak valid');
  });

  it('should decode a token without verification', async () => {
    const token = await generateToken(mockPayload);
    const decoded = decodeToken(token);
    expect(decoded).toMatchObject(mockPayload);
  });
});
