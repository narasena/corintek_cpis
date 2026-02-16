import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateParameterLimit, updateParameterLimitBatch } from './limits-service';

vi.mock('@/lib/rbac', () => ({
  ensureAccess: vi.fn(),
  RbacResource: {
    MASTER_DATA: 'MASTER_DATA',
  },
}));

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      parameter: {
        update: vi.fn(),
      },
      $transaction: vi.fn(async operations => {
        return Promise.all(
          operations.map(operation => {
            return operation;
          })
        );
      }),
    },
  };
});

const { prisma } = await import('@/lib/prisma');

describe('updateParameterLimit service', () => {
  const actor = { role: 'ADMIN' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates single limit fields correctly', async () => {
    vi.mocked(prisma.parameter.update).mockResolvedValue({ id: 'param-1' } as any);

    await updateParameterLimit(actor, {
      parameterId: 'param-1',
      minValue: 10,
    });

    expect(prisma.parameter.update).toHaveBeenCalledTimes(1);
    expect(prisma.parameter.update).toHaveBeenCalledWith({
      where: { id: 'param-1' },
      data: { minValue: 10 },
    });
  });

  it('updates all provided limit fields together', async () => {
    vi.mocked(prisma.parameter.update).mockResolvedValue({ id: 'param-1' } as any);

    await updateParameterLimit(actor, {
      parameterId: 'param-1',
      minValue: 5,
      maxValue: 10,
      rawWaterMinValue: 1,
      rawWaterMaxValue: 2,
    });

    expect(prisma.parameter.update).toHaveBeenCalledTimes(1);
    expect(prisma.parameter.update).toHaveBeenCalledWith({
      where: { id: 'param-1' },
      data: {
        minValue: 5,
        maxValue: 10,
        rawWaterMinValue: 1,
        rawWaterMaxValue: 2,
      },
    });
  });

  it('allows null values and persists them', async () => {
    vi.mocked(prisma.parameter.update).mockResolvedValue({ id: 'param-1' } as any);

    await updateParameterLimit(actor, {
      parameterId: 'param-1',
      minValue: null,
      maxValue: 10,
    });

    expect(prisma.parameter.update).toHaveBeenCalledWith({
      where: { id: 'param-1' },
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

    expect(prisma.parameter.update).not.toHaveBeenCalled();
  });

  it('throws when rawWaterMinValue is greater than rawWaterMaxValue', async () => {
    await expect(
      updateParameterLimit(actor, {
        parameterId: 'param-1',
        rawWaterMinValue: 5,
        rawWaterMaxValue: 1,
      })
    ).rejects.toThrow('Nilai raw minimum tidak boleh lebih besar dari maksimum');

    expect(prisma.parameter.update).not.toHaveBeenCalled();
  });

  it('throws when no limit fields are provided', async () => {
    await expect(
      updateParameterLimit(actor, {
        parameterId: 'param-1',
      })
    ).rejects.toThrow('Tidak ada nilai limit yang diubah');

    expect(prisma.parameter.update).not.toHaveBeenCalled();
  });
});

describe('updateParameterLimitBatch service', () => {
  const actor = { role: 'ADMIN' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs updates inside a single transaction', async () => {
    vi.mocked(prisma.parameter.update).mockResolvedValue({} as any);

    await updateParameterLimitBatch(actor, {
      items: [
        { parameterId: 'p1', minValue: 1 },
        { parameterId: 'p2', maxValue: 2 },
      ],
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    const firstCallArgs = vi.mocked(prisma.$transaction).mock.calls[0];
    expect(firstCallArgs).toHaveLength(1);
    const operations = firstCallArgs[0];
    expect(Array.isArray(operations)).toBe(true);
    expect(operations).toHaveLength(2);
  });
});
