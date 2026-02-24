/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TEntryState, TMachine, TParameter } from '../types';

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
    <MobileEntryCard
      param={props?.param ?? createMockParam()}
      machines={props?.machines ?? [createMockMachine()]}
      entryState={props?.entryState ?? {}}
      setEntryState={setEntryState}
      hasNotes={props?.hasNotes}
      isWaterMeter={props?.isWaterMeter}
    />
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

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading.textContent).toContain('Temperature');
    });

    it('renders unit when present (main path)', async () => {
      await renderCard({ param: createMockParam({ unit: '°C' }) });

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading.textContent).toContain('°C');
    });

    it('renders target with limits (main path)', async () => {
      await renderCard({
        param: createMockParam({ minValue: 10, maxValue: 50 }),
      });

      expect(screen.queryByText(/10.*50/)).not.toBeNull();
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
          'param-1:m-1:VALUE': { valueType: 'NUMBER', numericValue: 42 },
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
          'param-1:m-1:VALUE': { valueType: 'NUMBER', numericValue: null },
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
          'param-1:m-1:VALUE': { valueType: 'NUMBER', numericValue: 5 },
        },
      });

      const input = screen.getByPlaceholderText('Nilai...');
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
          'param-1:m-1:VALUE': { valueType: 'NUMBER', numericValue: 60 },
        },
      });

      const input = screen.getByPlaceholderText('Nilai...');
      expect(input.className).toContain('border-red-500');
    });

    it('does not apply red styling when value is in range (main path)', async () => {
      await renderCard({
        param: createMockParam({
          valueType: 'NUMBER',
          minValue: 10,
          maxValue: 50,
        }),
        machines: [createMockMachine({ id: 'm-1' })],
        entryState: {
          'param-1:m-1:VALUE': { valueType: 'NUMBER', numericValue: 30 },
        },
      });

      const input = screen.getByPlaceholderText('Nilai...');
      expect(input.className).not.toContain('border-red-500');
    });

    it('handles null minValue (edge case)', async () => {
      await renderCard({
        param: createMockParam({
          valueType: 'NUMBER',
          minValue: null,
          maxValue: 50,
        }),
        machines: [createMockMachine({ id: 'm-1' })],
        entryState: {
          'param-1:m-1:VALUE': { valueType: 'NUMBER', numericValue: 30 },
        },
      });

      const input = screen.getByPlaceholderText('Nilai...');
      expect(input.className).not.toContain('border-red-500');
    });

    it('handles null maxValue (edge case)', async () => {
      await renderCard({
        param: createMockParam({
          valueType: 'NUMBER',
          minValue: 10,
          maxValue: null,
        }),
        machines: [createMockMachine({ id: 'm-1' })],
        entryState: {
          'param-1:m-1:VALUE': { valueType: 'NUMBER', numericValue: 30 },
        },
      });

      const input = screen.getByPlaceholderText('Nilai...');
      expect(input.className).not.toContain('border-red-500');
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
          'param-1:m-1:VALUE': { valueType: 'BOOLEAN', boolValue: true },
        },
      });

      expect(screen.queryByText('Ya')).not.toBeNull();
    });

    it('shows "Tidak" when unchecked (main path)', async () => {
      await renderCard({
        param: createMockParam({ valueType: 'BOOLEAN', id: 'param-1' }),
        machines: [createMockMachine({ id: 'm-1' })],
        entryState: {
          'param-1:m-1:VALUE': { valueType: 'BOOLEAN', boolValue: false },
        },
      });

      expect(screen.queryByText('Tidak')).not.toBeNull();
    });

    it('shows "Pilih..." when null (edge case)', async () => {
      await renderCard({
        param: createMockParam({ valueType: 'BOOLEAN', id: 'param-1' }),
        machines: [createMockMachine({ id: 'm-1' })],
        entryState: {
          'param-1:m-1:VALUE': { valueType: 'BOOLEAN', boolValue: null },
        },
      });

      expect(screen.queryByText('Pilih...')).not.toBeNull();
    });

    it('renders "Kosongkan" button (main path)', async () => {
      await renderCard({ param: createMockParam({ valueType: 'BOOLEAN' }) });

      expect(screen.queryByText('Kosongkan')).not.toBeNull();
    });

    it('clears value when "Kosongkan" clicked (main path)', async () => {
      const { setEntryState } = await renderCard({
        param: createMockParam({ valueType: 'BOOLEAN', id: 'param-1' }),
        machines: [createMockMachine({ id: 'm-1' })],
        entryState: {
          'param-1:m-1:VALUE': { valueType: 'BOOLEAN', boolValue: true },
        },
      });

      await userEvent.click(screen.getByText('Kosongkan'));

      expect(setEntryState).toHaveBeenCalled();
      const lastCall = setEntryState.mock.calls[0];
      const prevState = {
        'param-1:m-1:VALUE': { valueType: 'BOOLEAN', boolValue: true },
      };
      const newState =
        typeof lastCall[0] === 'function'
          ? lastCall[0](prevState)
          : lastCall[0];
      expect(newState['param-1:m-1:VALUE']).toEqual({
        valueType: 'BOOLEAN',
        boolValue: null,
      });
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
          'param-1:m-1:VALUE': { valueType: 'TEXT', textValue: 'Test note' },
        },
      });

      const input = screen.getByPlaceholderText('Keterangan...');
      expect((input as HTMLInputElement).value).toBe('Test note');
    });

    it('updates state on text input (main path)', async () => {
      const { setEntryState } = await renderCard({
        param: createMockParam({ valueType: 'TEXT' }),
      });

      const input = screen.getByPlaceholderText('Keterangan...');
      await userEvent.type(input, 'Note');

      expect(setEntryState).toHaveBeenCalled();
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

    it('does not render notes when hasNotes is false (main path)', async () => {
      await renderCard({ hasNotes: false });

      expect(screen.queryByText('Catatan')).toBeNull();
    });

    it('uses null machineId for NOTE entries (main path)', async () => {
      const { setEntryState } = await renderCard({
        param: createMockParam({ id: 'param-1' }),
        hasNotes: true,
      });

      const input = screen.getByPlaceholderText('Catatan tambahan...');
      await userEvent.type(input, 'N');

      expect(setEntryState).toHaveBeenCalled();
      const lastCall = setEntryState.mock.calls[0];
      const prevState = {};
      const newState =
        typeof lastCall[0] === 'function'
          ? lastCall[0](prevState)
          : lastCall[0];
      expect(newState).toHaveProperty('param-1:null:NOTE');
      expect(newState['param-1:null:NOTE']).toHaveProperty('valueType', 'TEXT');
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

    it('does not render camera when isWaterMeter returns false (main path)', async () => {
      await renderCard({
        param: createMockParam({ valueType: 'NUMBER', name: 'Temperature' }),
        isWaterMeter: name => name === 'Water Meter',
      });

      expect(screen.queryByTestId('camera-input')).toBeNull();
    });

    it('does not render camera when isWaterMeter is undefined (edge case)', async () => {
      await renderCard({
        param: createMockParam({ valueType: 'NUMBER' }),
      });

      expect(screen.queryByTestId('camera-input')).toBeNull();
    });

    it('updates fileUrl and pendingFile on camera capture (main path)', async () => {
      const { setEntryState } = await renderCard({
        param: createMockParam({ valueType: 'NUMBER', id: 'param-1' }),
        machines: [createMockMachine({ id: 'm-1' })],
        isWaterMeter: () => true,
      });

      await userEvent.click(screen.getByTestId('camera-input'));

      expect(setEntryState).toHaveBeenCalled();
      const lastCall = setEntryState.mock.calls[0];
      const prevState = {};
      const newState =
        typeof lastCall[0] === 'function'
          ? lastCall[0](prevState)
          : lastCall[0];
      expect(newState).toHaveProperty('param-1:m-1:VALUE');
      expect(newState['param-1:m-1:VALUE']).toHaveProperty(
        'fileUrl',
        'http://example.com/photo.jpg'
      );
      expect(newState['param-1:m-1:VALUE']).toHaveProperty('pendingFile');
    });

    it('preserves numericValue when updating file (main path)', async () => {
      const { setEntryState } = await renderCard({
        param: createMockParam({ valueType: 'NUMBER', id: 'param-1' }),
        machines: [createMockMachine({ id: 'm-1' })],
        entryState: {
          'param-1:m-1:VALUE': { valueType: 'NUMBER', numericValue: 100 },
        },
        isWaterMeter: () => true,
      });

      await userEvent.click(screen.getByTestId('camera-input'));

      expect(setEntryState).toHaveBeenCalled();
      const lastCall = setEntryState.mock.calls[0];
      const prevState = {
        'param-1:m-1:VALUE': { valueType: 'NUMBER', numericValue: 100 },
      };
      const newState =
        typeof lastCall[0] === 'function'
          ? lastCall[0](prevState)
          : lastCall[0];
      expect(newState['param-1:m-1:VALUE']).toHaveProperty('numericValue', 100);
      expect(newState['param-1:m-1:VALUE']).toHaveProperty(
        'fileUrl',
        'http://example.com/photo.jpg'
      );
    });
  });

  describe('no machines fallback', () => {
    it('uses null machine when machines array is empty (edge case)', async () => {
      const { setEntryState } = await renderCard({
        param: createMockParam({ valueType: 'NUMBER', id: 'param-1' }),
        machines: [],
      });

      const input = screen.getByPlaceholderText('Nilai...');
      await userEvent.type(input, '10');

      expect(setEntryState).toHaveBeenCalled();
      const lastCall =
        setEntryState.mock.calls[setEntryState.mock.calls.length - 1];
      const prevState = {};
      const newState =
        typeof lastCall[0] === 'function'
          ? lastCall[0](prevState)
          : lastCall[0];
      expect(newState).toHaveProperty('param-1:null:VALUE');
      expect(newState['param-1:null:VALUE']).toHaveProperty(
        'valueType',
        'NUMBER'
      );
    });

    it('does not show machine label when machines array is empty (edge case)', async () => {
      await renderCard({ machines: [] });

      expect(screen.queryByText(/Chiller|CT/)).toBeNull();
    });
  });

  describe('multiple machines', () => {
    it('renders input for each machine (main path)', async () => {
      await renderCard({
        param: createMockParam({ valueType: 'NUMBER' }),
        machines: [
          createMockMachine({ id: 'm-1' }),
          createMockMachine({ id: 'm-2' }),
        ],
      });

      const inputs = screen.getAllByPlaceholderText('Nilai...');
      expect(inputs).toHaveLength(2);
    });

    it('maintains separate state per machine (main path)', async () => {
      await renderCard({
        param: createMockParam({ valueType: 'NUMBER', id: 'param-1' }),
        machines: [
          createMockMachine({ id: 'm-1' }),
          createMockMachine({ id: 'm-2' }),
        ],
        entryState: {
          'param-1:m-1:VALUE': { valueType: 'NUMBER', numericValue: 10 },
          'param-1:m-2:VALUE': { valueType: 'NUMBER', numericValue: 20 },
        },
      });

      const inputs = screen.getAllByPlaceholderText('Nilai...');
      expect((inputs[0] as HTMLInputElement).value).toBe('10');
      expect((inputs[1] as HTMLInputElement).value).toBe('20');
    });
  });
});
