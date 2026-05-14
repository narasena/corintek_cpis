import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveWorkReportSignatureAction } from './actions';
import * as service from './service';

// Mock dependencies
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/features/auth/lib/user-context', () => ({
  requireActor: vi.fn(),
}));

vi.mock('./service', () => ({
  saveWorkReportSignature: vi.fn(),
}));

import { requireActor } from '@/features/auth/lib/user-context';

describe('saveWorkReportSignatureAction', () => {
  const mockActor = {
    id: 'user-1',
    email: 'user@example.com',
    role: 'TECHNICIAN',
  };
  const validPayload = {
    workReportId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    dataUrl: 'data:image/png;base64,fake-data',
    role: 'TECHNICIAN' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns Unauthorized when actor is missing', async () => {
    // Define AuthenticationError class matching the one in auth-helpers
    class AuthenticationError extends Error {
      constructor(message = 'Unauthorized') {
        super(message);
        this.name = 'AuthenticationError';
      }
    }

    vi.mocked(requireActor).mockRejectedValueOnce(new AuthenticationError());

    const result = await saveWorkReportSignatureAction(validPayload);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Unauthorized');
    }
  });

  it('calls domain service and revalidates paths on success', async () => {
    vi.mocked(requireActor).mockResolvedValueOnce(mockActor as any);
    const mockResult = {
      projectId: 'proj-1',
    };
    vi.mocked(service.saveWorkReportSignature).mockResolvedValueOnce(
      mockResult as any
    );

    const { revalidatePath } = await import('next/cache');

    const result = await saveWorkReportSignatureAction(validPayload);

    expect(result.success).toBe(true);
    expect(service.saveWorkReportSignature).toHaveBeenCalledWith(
      validPayload.workReportId,
      expect.objectContaining({
        signatureDataUrl: validPayload.dataUrl,
        signedByUserId: mockActor.id,
        role: validPayload.role,
        actorRole: mockActor.role,
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith('/projects/proj-1');
  });

  it('returns validation error message when input is invalid', async () => {
    vi.mocked(requireActor).mockResolvedValueOnce(mockActor as any);
    const invalidPayload = {
      workReportId: 'not-a-uuid',
      dataUrl: 'not-a-data-url',
      role: 'TECHNICIAN',
    };

    const result = await saveWorkReportSignatureAction(invalidPayload as any);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it('returns validation error details when payload is invalid', async () => {
    vi.mocked(requireActor).mockResolvedValueOnce(mockActor as any);
    const invalidPayload = {
      workReportId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      // dataUrl missing
      role: 'TECHNICIAN',
    };

    const result = await saveWorkReportSignatureAction(invalidPayload as any);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('expected string');
    }
  });
});
