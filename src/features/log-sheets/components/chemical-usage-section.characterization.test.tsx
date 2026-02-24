/** @vitest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TChemicalUsageState } from './chemical-usage-section';

const mockGetChemicalsAction = vi.fn();

vi.mock('@/features/chemicals/actions', () => ({
  getChemicalsAction: (...args: unknown[]) => mockGetChemicalsAction(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

function createMockChemical(overrides?: Record<string, unknown>) {
  return {
    id: 'chem-1',
    name: 'Test Chemical',
    unit: 'L',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

async function renderSection(props?: {
  usages?: TChemicalUsageState;
  onChange?: (usages: TChemicalUsageState) => void;
  disabled?: boolean;
}) {
  const { ChemicalUsageSection } = await import('./chemical-usage-section');
  return render(
    <ChemicalUsageSection
      usages={props?.usages ?? []}
      onChange={props?.onChange ?? vi.fn()}
      disabled={props?.disabled}
    />
  );
}

describe('ChemicalUsageSection - characterization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetChemicalsAction.mockResolvedValue({
      success: true,
      data: [
        createMockChemical({ id: 'chem-1', name: 'Chemical A', unit: 'L' }),
        createMockChemical({ id: 'chem-2', name: 'Chemical B', unit: 'kg' }),
      ],
    });
  });

  describe('initial rendering', () => {
    it('renders section title (main path)', async () => {
      await renderSection();
      expect(screen.queryByText('Penggunaan Chemical')).not.toBeNull();
    });

    it('renders chemical select (main path)', async () => {
      await renderSection();
      expect(screen.queryByText('Pilih chemical...')).not.toBeNull();
    });

    it('renders add button (main path)', async () => {
      await renderSection();
      expect(screen.queryByText('Tambah')).not.toBeNull();
    });

    it('shows empty state message when no usages (main path)', async () => {
      await renderSection();
      expect(
        screen.queryByText('Belum ada penggunaan chemical')
      ).not.toBeNull();
    });
  });

  describe('chemical loading', () => {
    it('calls getChemicalsAction on mount (main path)', async () => {
      await renderSection();
      expect(mockGetChemicalsAction).toHaveBeenCalled();
    });

    it('shows error toast when chemicals fail to load (error condition)', async () => {
      const { toast } = await import('sonner');
      mockGetChemicalsAction.mockResolvedValueOnce({
        success: false,
        error: 'Database error',
      });

      await renderSection();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Database error');
      });
    });

    it('handles null chemicals data (edge case)', async () => {
      mockGetChemicalsAction.mockResolvedValueOnce({
        success: true,
        data: null,
      });

      await renderSection();

      await waitFor(() => {
        expect(mockGetChemicalsAction).toHaveBeenCalled();
      });
    });
  });

  describe('table rendering', () => {
    it('displays chemical name in table (main path)', async () => {
      await renderSection({
        usages: [
          {
            chemicalId: 'chem-1',
            amount: 10,
            chemicalName: 'Chemical A',
            unit: 'L',
          },
        ],
      });

      expect(screen.queryByText('Chemical A')).not.toBeNull();
    });

    it('displays amount with unit in table (main path)', async () => {
      await renderSection({
        usages: [
          {
            chemicalId: 'chem-1',
            amount: 10.5,
            chemicalName: 'Chemical A',
            unit: 'L',
          },
        ],
      });

      expect(screen.queryByText('10.5 L')).not.toBeNull();
    });

    it('shows Loading... when chemicalName is missing (edge case)', async () => {
      await renderSection({
        usages: [
          {
            chemicalId: 'chem-1',
            amount: 10,
            unit: 'L',
          },
        ],
      });

      expect(screen.queryByText('Loading...')).not.toBeNull();
    });
  });

  describe('disabled state', () => {
    it('disables select when disabled prop is true (edge case)', async () => {
      await renderSection({ disabled: true });

      const select = screen.getByRole('combobox');
      expect(select.hasAttribute('disabled')).toBe(true);
    });

    it('disables add button when disabled prop is true (edge case)', async () => {
      await renderSection({ disabled: true });

      const addBtn = screen.getByText('Tambah');
      expect(addBtn.hasAttribute('disabled')).toBe(true);
    });

    it('disables remove buttons when disabled prop is true (edge case)', async () => {
      await renderSection({
        disabled: true,
        usages: [
          {
            chemicalId: 'chem-1',
            amount: 10,
            chemicalName: 'Chemical A',
            unit: 'L',
          },
        ],
      });

      const removeBtns = screen.getAllByRole('button', { name: '' });
      expect(removeBtns[0].hasAttribute('disabled')).toBe(true);
    });
  });

  describe('removing chemicals', () => {
    it('calls onChange when removing chemical (main path)', async () => {
      const onChange = vi.fn();
      await renderSection({
        onChange,
        usages: [
          {
            chemicalId: 'chem-1',
            amount: 10,
            chemicalName: 'Chemical A',
            unit: 'L',
          },
          {
            chemicalId: 'chem-2',
            amount: 5,
            chemicalName: 'Chemical B',
            unit: 'kg',
          },
        ],
      });

      const removeBtns = screen.getAllByRole('button', { name: '' });
      await removeBtns[0].click();

      expect(onChange).toHaveBeenCalledWith([
        expect.objectContaining({
          chemicalId: 'chem-2',
        }),
      ]);
    });

    it('shows empty state after removing all (edge case)', async () => {
      const onChange = vi.fn();
      await renderSection({
        onChange,
        usages: [
          {
            chemicalId: 'chem-1',
            amount: 10,
            chemicalName: 'Chemical A',
            unit: 'L',
          },
        ],
      });

      const removeBtn = screen.getByRole('button', { name: '' });
      await removeBtn.click();

      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('component structure', () => {
    it('renders table headers (main path)', async () => {
      await renderSection();

      const headers = screen.getAllByText('Nama Chemical');
      expect(headers.length).toBeGreaterThan(0);
    });

    it('has correct number of columns (main path)', async () => {
      await renderSection();

      const tableHeaders = screen.getAllByRole('columnheader');
      expect(tableHeaders.length).toBe(3);
    });
  });
});
