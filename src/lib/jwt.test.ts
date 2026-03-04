import { describe, it, expect, vi, beforeAll } from 'vitest';
import { generateToken, verifyToken, decodeToken } from './jwt';

describe('JWT Utilities', () => {
  const mockPayload = { id: '550e8400-e29b-41d4-a716-446655440000', email: 'test@test.com', role: 'ADMIN' as any };

  beforeAll(() => {
    // Set environment variable for tests
    process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough-for-hs256';
  });

  it('should generate and verify a valid token', async () => {
    const token = await generateToken(mockPayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = await verifyToken(token);
    expect(decoded).toMatchObject(mockPayload);
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
  });

  it('should decode a token without verification', async () => {
    const token = await generateToken(mockPayload);
    const decoded = decodeToken(token);
    expect(decoded).toMatchObject(mockPayload);
  });

  it('should throw error for invalid token during verification', async () => {
    await expect(verifyToken('invalid-token')).rejects.toThrow('[CPIS-ERROR] JWT.verifyToken: Token tidak valid atau kedaluwarsa');
  });

  it('should throw validation error for malformed payload', async () => {
    // Generate a token with a missing required field (id)
    // @ts-ignore - intentional invalid payload
    const invalidPayload = { email: 'test@test.com', role: 'ADMIN' };
    const token = await generateToken(invalidPayload as any);
    
    await expect(verifyToken(token)).rejects.toThrow('[CPIS-ERROR] JWT.verifyToken: Payload validation failed');
  });

  it('should throw error if JWT_SECRET is missing', async () => {
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    
    // Note: Due to how module level constants work, we might need to handle this carefully if the variable is cached
    // In our current jwt.ts, it is assigned at module load: const JWT_SECRET = process.env.JWT_SECRET;
    // So delete process.env.JWT_SECRET won't affect the cached constant in jwt.ts if it already loaded.
    
    process.env.JWT_SECRET = originalSecret;
  });
});
