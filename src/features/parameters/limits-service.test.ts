import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  updateParameterLimit,
  updateParameterLimitBatch,
} from './limits-service';

vi.mock('@/lib/rbac', () => ({
  ensureAccess: vi.fn(),
  RbacResource: {
    PARAMETERS: 'PARAMETERS',
  },
}));

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      parameterLimitProfile: {
        findFirst: vi.fn(),
      },
      parameterLimit: {
        findFirst: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
        upsert: vi.fn(),
      },
      $transaction: vi.fn(async operations => {
        return Promise.all(operations);
      }),
    },
  };
});

const { prisma } = await import('@/lib/prisma');

describe('updateParameterLimit service', () => {
  const actor = { role: 'ADMIN' } as any;
  const mockDefaultProfile = { id: 'default-profile-id', isDefault: true };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.parameterLimitProfile.findFirst).mockResolvedValue(
      mockDefaultProfile as any
    );
  });

  it('updates single limit fields correctly', async () => {
    vi.mocked(prisma.parameterLimit.findFirst).mockResolvedValue({
      id: 'limit-1',
      parameterId: 'param-1',
    } as any);
    vi.mocked(prisma.parameterLimit.update).mockResolvedValue({
      id: 'limit-1',
    } as any);

    await updateParameterLimit(actor, {
      parameterId: 'param-1',
      minValue: 10,
    });

    expect(prisma.parameterLimit.update).toHaveBeenCalledWith({
      where: { id: 'limit-1' },
      data: { minValue: 10 },
    });
  });

  it('creates new limit if not exists', async () => {
    vi.mocked(prisma.parameterLimit.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.parameterLimit.create).mockResolvedValue({
      id: 'new-limit',
    } as any);

    await updateParameterLimit(actor, {
      parameterId: 'param-1',
      minValue: 10,
    });

    expect(prisma.parameterLimit.create).toHaveBeenCalledWith({
      data: {
        profileId: mockDefaultProfile.id,
        parameterId: 'param-1',
        minValue: 10,
      },
    });
  });

  it('updates all provided limit fields together', async () => {
    vi.mocked(prisma.parameterLimit.findFirst).mockResolvedValue({
      id: 'limit-1',
    } as any);

    await updateParameterLimit(actor, {
      parameterId: 'param-1',
      minValue: 5,
      maxValue: 10,
      rawWaterMinValue: 1,
      rawWaterMaxValue: 2,
    });

    expect(prisma.parameterLimit.update).toHaveBeenCalledWith({
      where: { id: 'limit-1' },
      data: {
        minValue: 5,
        maxValue: 10,
        rawWaterMinValue: 1,
        rawWaterMaxValue: 2,
      },
    });
  });

  it('allows null values and persists them', async () => {
    vi.mocked(prisma.parameterLimit.findFirst).mockResolvedValue({
      id: 'limit-1',
    } as any);

    await updateParameterLimit(actor, {
      parameterId: 'param-1',
      minValue: null,
      maxValue: 10,
    });

    expect(prisma.parameterLimit.update).toHaveBeenCalledWith({
      where: { id: 'limit-1' },
      data: {
        minValue: null,
        maxValue: 10,
      },
    });
  });

  it('throws when minValue is greater than maxValue', async () => {
    await expect(
      updateParameterLimit(actor, {
        parameterId: 'param-1',
        minValue: 20,
        maxValue: 10,
      })
    ).rejects.toThrow('Nilai minimum tidak boleh lebih besar dari maksimum');

    expect(prisma.parameterLimit.update).not.toHaveBeenCalled();
  });

  it('throws when no limit fields are provided', async () => {
    await expect(
      updateParameterLimit(actor, {
        parameterId: 'param-1',
      })
    ).rejects.toThrow('Tidak ada nilai limit yang diubah');
  });
});

describe('updateParameterLimitBatch service', () => {
  const actor = { role: 'ADMIN' } as any;
  const mockDefaultProfile = { id: 'default-profile-id', isDefault: true };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.parameterLimitProfile.findFirst).mockResolvedValue(
      mockDefaultProfile as any
    );
  });

  it('runs updates inside a single transaction using upsert', async () => {
    await updateParameterLimitBatch(actor, {
      items: [
        { parameterId: 'p1', minValue: 1 },
        { parameterId: 'p2', maxValue: 2 },
      ],
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.parameterLimit.upsert).toHaveBeenCalledTimes(2);

    expect(prisma.parameterLimit.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          profileId_parameterId: {
            profileId: mockDefaultProfile.id,
            parameterId: 'p1',
          },
        },
        update: { minValue: 1 },
      })
    );
  });
});
