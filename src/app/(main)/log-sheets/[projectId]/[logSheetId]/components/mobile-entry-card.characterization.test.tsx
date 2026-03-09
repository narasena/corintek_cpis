/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TEntryState, TMachine, TParameter } from '../types';
import { EntryStateProvider } from '@/features/log-sheets/context';

vi.mock('@/components/camera-input', () => ({
  CameraInput: ({
    value,
    onChange,
  }: {
    value?: string;
    onChange: (url: string, file: File) => void;
  }) => (
    <button
      data-testid="camera-input"
      onClick={() =>
        onChange('http://example.com/photo.jpg', new File([], 'test.jpg'))
      }
    >
      Camera ({value ?? 'no photo'})
    </button>
  ),
}));

function createMockParam(overrides?: Partial<TParameter>): TParameter {
  return {
    id: 'param-1',
    name: 'Test Parameter',
    variableName: 'test_param',
    valueType: 'NUMBER',
    unit: '°C',
    minValue: 0,
    maxValue: 100,
    ...overrides,
  } as TParameter;
}

function createMockMachine(overrides?: Partial<TMachine>): TMachine {
  return {
    id: 'm-1',
    unitNumber: 1,
    type: 'CHILLER',
    ...overrides,
  } as TMachine;
}

async function renderCard(props?: {
  param?: TParameter;
  machines?: TMachine[];
  entryState?: Record<string, TEntryState>;
  hasNotes?: boolean;
  isWaterMeter?: (paramName: string) => boolean;
}) {
  const { MobileEntryCard } = await import('./mobile-entry-card');
  const setEntryState = vi.fn();

  const result = render(
    <EntryStateProvider
      entryState={props?.entryState ?? {}}
      setEntryState={setEntryState}
    >
      <MobileEntryCard
        param={props?.param ?? createMockParam()}
        machines={props?.machines ?? [createMockMachine()]}
        hasNotes={props?.hasNotes}
        isWaterMeter={props?.isWaterMeter}
      />
    </EntryStateProvider>
  );

  return { ...result, setEntryState };
}

describe('MobileEntryCard - characterization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial rendering', () => {
    it('renders parameter name (main path)', async () => {
      await renderCard({ param: createMockParam({ name: 'Temperature' }) });

      // In current implementation, it's a div with font-medium
      expect(screen.getByText(/Temperature/)).not.toBeNull();
    });

    it('renders unit when present (main path)', async () => {
      await renderCard({ param: createMockParam({ unit: '°C' }) });

      // Unit appears in name AND target line, so we check for at least one
      const elements = screen.queryAllByText(/°C/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('renders target with limits (main path)', async () => {
      await renderCard({
        param: createMockParam({ minValue: 10, maxValue: 50 }),
      });

      expect(screen.queryAllByText(/10.*50/).length).toBeGreaterThan(0);
    });

    it('renders machine label for multiple machines (main path)', async () => {
      await renderCard({
        machines: [
          createMockMachine({ id: 'm-1', unitNumber: 1 }),
          createMockMachine({ id: 'm-2', unitNumber: 2 }),
        ],
      });

      expect(screen.queryByText('Chiller #1')).not.toBeNull();
      expect(screen.queryByText('Chiller #2')).not.toBeNull();
    });

    it('renders CT machine label (main path)', async () => {
      await renderCard({
        machines: [createMockMachine({ type: 'COOLING_TOWER', unitNumber: 3 })],
      });

      expect(screen.queryByText('CT #3')).not.toBeNull();
    });
  });

  describe('NUMBER type input', () => {
    it('renders number input for NUMBER type (main path)', async () => {
      await renderCard({ param: createMockParam({ valueType: 'NUMBER' }) });

      expect(screen.queryByPlaceholderText('Nilai...')).not.toBeNull();
    });

    it('updates state on input change (main path)', async () => {
      const { setEntryState } = await renderCard({
        param: createMockParam({ valueType: 'NUMBER' }),
      });

      const input = screen.getByPlaceholderText('Nilai...');
      await userEvent.type(input, '25');

      expect(setEntryState).toHaveBeenCalled();
    });

    it('displays current value from entryState (main path)', async () => {
      await renderCard({
        param: createMockParam({ valueType: 'NUMBER', id: 'param-1' }),
        machines: [createMockMachine({ id: 'm-1' })],
        entryState: {
          'param-1:m-1:VALUE': {
            valueType: 'NUMBER',
            numericValue: 42,
            boolValue: null,
            textValue: null,
          },
        },
      });

      const input = screen.getByPlaceholderText('Nilai...');
      expect((input as HTMLInputElement).value).toBe('42');
    });

    it('shows empty string when numericValue is null (edge case)', async () => {
      await renderCard({
        param: createMockParam({ valueType: 'NUMBER', id: 'param-1' }),
        machines: [createMockMachine({ id: 'm-1' })],
        entryState: {
          'param-1:m-1:VALUE': {
            valueType: 'NUMBER',
            numericValue: null,
            boolValue: null,
            textValue: null,
          },
        },
      });

      const input = screen.getByPlaceholderText('Nilai...');
      expect((input as HTMLInputElement).value).toBe('');
    });
  });

  describe('out of range styling', () => {
    it('applies red styling when value is below min (edge case)', async () => {
      await renderCard({
        param: createMockParam({
          valueType: 'NUMBER',
          minValue: 10,
          maxValue: 50,
        }),
        machines: [createMockMachine({ id: 'm-1' })],
        entryState: {
          'param-1:m-1:VALUE': {
            valueType: 'NUMBER',
            numericValue: 5,
            boolValue: null,
            textValue: null,
          },
        },
      });

      const input = screen.getByPlaceholderText('Nilai...');
      // Component uses native color styling for error or custom classes
      expect(input.className).toContain('border-red-500');
    });

    it('applies red styling when value is above max (edge case)', async () => {
      await renderCard({
        param: createMockParam({
          valueType: 'NUMBER',
          minValue: 10,
          maxValue: 50,
        }),
        machines: [createMockMachine({ id: 'm-1' })],
        entryState: {
          'param-1:m-1:VALUE': {
            valueType: 'NUMBER',
            numericValue: 60,
            boolValue: null,
            textValue: null,
          },
        },
      });

      const input = screen.getByPlaceholderText('Nilai...');
      expect(input.className).toContain('border-red-500');
    });
  });

  describe('BOOLEAN type input', () => {
    it('renders checkbox for BOOLEAN type (main path)', async () => {
      await renderCard({ param: createMockParam({ valueType: 'BOOLEAN' }) });

      expect(screen.queryByRole('checkbox')).not.toBeNull();
    });

    it('shows "Ya" when checked (main path)', async () => {
      await renderCard({
        param: createMockParam({ valueType: 'BOOLEAN', id: 'param-1' }),
        machines: [createMockMachine({ id: 'm-1' })],
        entryState: {
          'param-1:m-1:VALUE': {
            valueType: 'BOOLEAN',
            boolValue: true,
            numericValue: null,
            textValue: null,
          },
        },
      });

      expect(screen.queryByText('Ya')).not.toBeNull();
    });

    it('shows "Tidak" when unchecked (main path)', async () => {
      await renderCard({
        param: createMockParam({ valueType: 'BOOLEAN', id: 'param-1' }),
        machines: [createMockMachine({ id: 'm-1' })],
        entryState: {
          'param-1:m-1:VALUE': {
            valueType: 'BOOLEAN',
            boolValue: false,
            numericValue: null,
            textValue: null,
          },
        },
      });

      expect(screen.queryByText('Tidak')).not.toBeNull();
    });

    it('renders "Hapus" button when has value (main path)', async () => {
      await renderCard({
        param: createMockParam({ valueType: 'BOOLEAN', id: 'param-1' }),
        machines: [createMockMachine({ id: 'm-1' })],
        entryState: {
          'param-1:m-1:VALUE': {
            valueType: 'BOOLEAN',
            boolValue: true,
            numericValue: null,
            textValue: null,
          },
        },
      });

      expect(screen.queryByText('Hapus')).not.toBeNull();
    });

    it('clears value when "Hapus" clicked (main path)', async () => {
      const { setEntryState } = await renderCard({
        param: createMockParam({ valueType: 'BOOLEAN', id: 'param-1' }),
        machines: [createMockMachine({ id: 'm-1' })],
        entryState: {
          'param-1:m-1:VALUE': {
            valueType: 'BOOLEAN',
            boolValue: true,
            numericValue: null,
            textValue: null,
          },
        },
      });

      await userEvent.click(screen.getByText('Hapus'));

      expect(setEntryState).toHaveBeenCalled();
    });
  });

  describe('TEXT type input', () => {
    it('renders text input for TEXT type (main path)', async () => {
      await renderCard({ param: createMockParam({ valueType: 'TEXT' }) });

      expect(screen.queryByPlaceholderText('Keterangan...')).not.toBeNull();
    });

    it('displays current text value (main path)', async () => {
      await renderCard({
        param: createMockParam({ valueType: 'TEXT', id: 'param-1' }),
        machines: [createMockMachine({ id: 'm-1' })],
        entryState: {
          'param-1:m-1:VALUE': {
            valueType: 'TEXT',
            textValue: 'Test note',
            numericValue: null,
            boolValue: null,
          },
        },
      });

      const input = screen.getByPlaceholderText('Keterangan...');
      expect((input as HTMLInputElement).value).toBe('Test note');
    });
  });

  describe('notes field', () => {
    it('renders notes input when hasNotes is true (main path)', async () => {
      await renderCard({ hasNotes: true });

      expect(screen.queryByText('Catatan')).not.toBeNull();
      expect(
        screen.queryByPlaceholderText('Catatan tambahan...')
      ).not.toBeNull();
    });
  });

  describe('camera input for water meter', () => {
    it('renders camera input when isWaterMeter returns true (main path)', async () => {
      await renderCard({
        param: createMockParam({ valueType: 'NUMBER', name: 'Water Meter' }),
        isWaterMeter: name => name === 'Water Meter',
      });

      expect(screen.queryByTestId('camera-input')).not.toBeNull();
    });
  });
});
