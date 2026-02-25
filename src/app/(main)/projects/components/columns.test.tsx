import { describe, it, expect } from 'vitest';

import { getProjectColumns } from './columns';
import type { IProject } from '@/features/projects/types';

describe('getProjectColumns - warranty column', () => {
  const baseProject: IProject = {
    id: 'p1',
    clientId: 'c1',
    name: 'Project 1',
    description: null,
    quoteNumber: null,
    poNumber: null,
    startDate: new Date('2024-01-01T00:00:00.000Z'),
    endDate: null,
    status: 'PENDING',
    workCategory: 'OPERATIONAL',
    contractType: 'DIRECT',
    warrantyMonths: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
  };

  const columns = getProjectColumns({
    onEdit: () => {},
    onRefresh: () => {},
    onDelete: async () => ({ success: true }),
  });

  const warrantyColumn = columns.find(
    col => col.accessorKey === 'warrantyMonths'
  );

  it('renders "-" when warrantyMonths is null or undefined', () => {
    expect(warrantyColumn).toBeDefined();

    const cell = warrantyColumn!.cell!;

    const withNull = cell({
      row: {
        original: { ...baseProject, warrantyMonths: null },
      },
    } as any);

    const withUndefined = cell({
      row: {
        original: { ...baseProject, warrantyMonths: undefined },
      },
    } as any);

    expect(String(withNull)).toContain('-');
    expect(String(withUndefined)).toContain('-');
  });

  it('renders "0 bulan" when warrantyMonths is zero', () => {
    expect(warrantyColumn).toBeDefined();

    const cell = warrantyColumn!.cell!;

    const rendered = cell({
      row: {
        original: { ...baseProject, warrantyMonths: 0 },
      },
    } as any);

    expect(String(rendered)).toContain('0');
    expect(String(rendered)).toContain('bulan');
  });

  it('renders "<n> bulan" when warrantyMonths has a positive value', () => {
    expect(warrantyColumn).toBeDefined();

    const cell = warrantyColumn!.cell!;

    const rendered = cell({
      row: {
        original: { ...baseProject, warrantyMonths: 12 },
      },
    } as any);

    expect(String(rendered)).toContain('12');
    expect(String(rendered)).toContain('bulan');
  });
});
