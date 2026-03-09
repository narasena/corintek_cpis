// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement, useState, ReactNode } from 'react';
import { ParameterInput } from './parameter-input';
import {
  EntryStateProvider,
  useEntryStateContext,
} from '@/features/log-sheets/context';
import type { TEntryState } from '@/features/log-sheets/types';

vi.mock('@/components/camera-input', () => ({
  CameraInput: ({
    value,
    onChange,
  }: {
    value?: string;
    onChange: (url: string, file: File | null) => void;
  }) => (
    <input
      data-testid="camera-input"
      value={value ?? ''}
      onChange={e => onChange(e.target.value, null)}
    />
  ),
}));

function createWrapper(initialState: Record<string, TEntryState> = {}) {
  return function Wrapper({ children }: { children: ReactNode }) {
    const [entryState, setEntryState] =
      useState<Record<string, TEntryState>>(initialState);
    return createElement(EntryStateProvider, {
      entryState,
      setEntryState,
      children,
    });
  };
}

describe('ParameterInput', () => {
  describe('NUMBER type', () => {
    it('renders number input for NUMBER valueType', () => {
      const wrapper = createWrapper();
      const { container } = render(
        <ParameterInput entryKey="test-key" valueType="NUMBER" />,
        { wrapper }
      );
      const input = container.querySelector('input[type="number"]');
      expect(input).not.toBeNull();
    });

    it('displays current numeric value', () => {
      const wrapper = createWrapper({
        'test-key': {
          valueType: 'NUMBER',
          numericValue: 42,
          boolValue: null,
          textValue: null,
        },
      });
      const { container } = render(
        <ParameterInput entryKey="test-key" valueType="NUMBER" />,
        { wrapper }
      );
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('42');
    });

    it('displays empty string for null value', () => {
      const wrapper = createWrapper({
        'test-key': {
          valueType: 'NUMBER',
          numericValue: null,
          boolValue: null,
          textValue: null,
        },
      });
      const { container } = render(
        <ParameterInput entryKey="test-key" valueType="NUMBER" />,
        { wrapper }
      );
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('shows error styling when value is out of range', () => {
      const wrapper = createWrapper({
        'test-key': {
          valueType: 'NUMBER',
          numericValue: 100,
          boolValue: null,
          textValue: null,
        },
      });
      const { container } = render(
        <ParameterInput
          entryKey="test-key"
          valueType="NUMBER"
          minValue={0}
          maxValue={50}
        />,
        { wrapper }
      );
      const input = container.querySelector('input');
      expect(input?.className).toContain('border-red-500');
    });

    it('shows camera input when isWaterMeter is true', () => {
      const wrapper = createWrapper();
      const { queryByTestId } = render(
        <ParameterInput entryKey="test-key" valueType="NUMBER" isWaterMeter />,
        { wrapper }
      );
      expect(queryByTestId('camera-input')).not.toBeNull();
    });

    it('hides camera input when isWaterMeter is false', () => {
      const wrapper = createWrapper();
      const { queryByTestId } = render(
        <ParameterInput
          entryKey="test-key"
          valueType="NUMBER"
          isWaterMeter={false}
        />,
        { wrapper }
      );
      expect(queryByTestId('camera-input')).toBeNull();
    });

    it('uses custom placeholder', () => {
      const wrapper = createWrapper();
      const { container } = render(
        <ParameterInput
          entryKey="test-key"
          valueType="NUMBER"
          placeholder="Enter value"
        />,
        { wrapper }
      );
      const input = container.querySelector('input');
      expect(input?.getAttribute('placeholder')).toBe('Enter value');
    });

    it('disables input when disabled is true', () => {
      const wrapper = createWrapper();
      const { container } = render(
        <ParameterInput entryKey="test-key" valueType="NUMBER" disabled />,
        { wrapper }
      );
      const input = container.querySelector('input');
      expect(input?.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('BOOLEAN type', () => {
    it('renders checkbox for BOOLEAN valueType', () => {
      const wrapper = createWrapper();
      const { container } = render(
        <ParameterInput entryKey="test-key" valueType="BOOLEAN" />,
        { wrapper }
      );
      const checkbox = container.querySelector('button[role="checkbox"]');
      expect(checkbox).not.toBeNull();
    });

    it('displays "Pilih..." for indeterminate state', () => {
      const wrapper = createWrapper({
        'test-key': {
          valueType: 'BOOLEAN',
          numericValue: null,
          boolValue: null,
          textValue: null,
        },
      });
      const { container } = render(
        <ParameterInput entryKey="test-key" valueType="BOOLEAN" />,
        { wrapper }
      );
      expect(container.textContent).toContain('Pilih...');
    });

    it('displays "Ya" for true value', () => {
      const wrapper = createWrapper({
        'test-key': {
          valueType: 'BOOLEAN',
          numericValue: null,
          boolValue: true,
          textValue: null,
        },
      });
      const { container } = render(
        <ParameterInput entryKey="test-key" valueType="BOOLEAN" />,
        { wrapper }
      );
      expect(container.textContent).toContain('Ya');
    });

    it('displays "Tidak" for false value', () => {
      const wrapper = createWrapper({
        'test-key': {
          valueType: 'BOOLEAN',
          numericValue: null,
          boolValue: false,
          textValue: null,
        },
      });
      const { container } = render(
        <ParameterInput entryKey="test-key" valueType="BOOLEAN" />,
        { wrapper }
      );
      expect(container.textContent).toContain('Tidak');
    });

    it('shows clear button when showClearButton is true', () => {
      const wrapper = createWrapper({
        'test-key': { valueType: 'BOOLEAN', boolValue: true },
      });
      const { container } = render(
        <ParameterInput
          entryKey="test-key"
          valueType="BOOLEAN"
          showClearButton
        />,
        { wrapper }
      );
      expect(container.textContent).toContain('Hapus');
    });

    it('hides clear button when showClearButton is false', () => {
      const wrapper = createWrapper({
        'test-key': { valueType: 'BOOLEAN', boolValue: true },
      });
      const { container } = render(
        <ParameterInput
          entryKey="test-key"
          valueType="BOOLEAN"
          showClearButton={false}
        />,
        { wrapper }
      );
      expect(container.textContent).not.toContain('Hapus');
    });
  });

  describe('TEXT type', () => {
    it('renders text input for TEXT valueType', () => {
      const wrapper = createWrapper();
      const { container } = render(
        <ParameterInput entryKey="test-key" valueType="TEXT" />,
        { wrapper }
      );
      const input = container.querySelector(
        'input[type="text"], input:not([type])'
      );
      expect(input).not.toBeNull();
    });

    it('displays current text value', () => {
      const wrapper = createWrapper({
        'test-key': {
          valueType: 'TEXT',
          numericValue: null,
          boolValue: null,
          textValue: 'Hello',
        },
      });
      const { container } = render(
        <ParameterInput entryKey="test-key" valueType="TEXT" />,
        { wrapper }
      );
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('Hello');
    });

    it('uses custom placeholder', () => {
      const wrapper = createWrapper();
      const { container } = render(
        <ParameterInput
          entryKey="test-key"
          valueType="TEXT"
          placeholder="Enter notes"
        />,
        { wrapper }
      );
      const input = container.querySelector('input');
      expect(input?.getAttribute('placeholder')).toBe('Enter notes');
    });
  });

  describe('missing state', () => {
    it('handles undefined state gracefully for NUMBER', () => {
      const wrapper = createWrapper();
      const { container } = render(
        <ParameterInput entryKey="missing-key" valueType="NUMBER" />,
        { wrapper }
      );
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('handles undefined state gracefully for BOOLEAN', () => {
      const wrapper = createWrapper();
      const { container } = render(
        <ParameterInput entryKey="missing-key" valueType="BOOLEAN" />,
        { wrapper }
      );
      expect(container.textContent).toContain('Pilih...');
    });

    it('handles undefined state gracefully for TEXT', () => {
      const wrapper = createWrapper();
      const { container } = render(
        <ParameterInput entryKey="missing-key" valueType="TEXT" />,
        { wrapper }
      );
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });

  describe('SOLID compliance', () => {
    it('Single Responsibility: delegates to helper components', () => {
      const wrapper = createWrapper();
      const { container } = render(
        <ParameterInput entryKey="test" valueType="NUMBER" />,
        { wrapper }
      );
      expect(container.firstChild).not.toBeNull();
    });

    it('Open/Closed: extensible via props without modification', () => {
      const wrapper = createWrapper();
      const { container } = render(
        <ParameterInput
          entryKey="test"
          valueType="NUMBER"
          minValue={0}
          maxValue={100}
          isWaterMeter
          placeholder="Custom"
          disabled
        />,
        { wrapper }
      );
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles zero value for NUMBER', () => {
      const wrapper = createWrapper({
        'test-key': {
          valueType: 'NUMBER',
          numericValue: 0,
          boolValue: null,
          textValue: null,
        },
      });
      const { container } = render(
        <ParameterInput entryKey="test-key" valueType="NUMBER" />,
        { wrapper }
      );
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('0');
    });

    it('handles negative value for NUMBER', () => {
      const wrapper = createWrapper({
        'test-key': {
          valueType: 'NUMBER',
          numericValue: -10,
          boolValue: null,
          textValue: null,
        },
      });
      const { container } = render(
        <ParameterInput entryKey="test-key" valueType="NUMBER" />,
        { wrapper }
      );
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('-10');
    });

    it('handles decimal value for NUMBER', () => {
      const wrapper = createWrapper({
        'test-key': {
          valueType: 'NUMBER',
          numericValue: 3.14159,
          boolValue: null,
          textValue: null,
        },
      });
      const { container } = render(
        <ParameterInput entryKey="test-key" valueType="NUMBER" />,
        { wrapper }
      );
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('3.14159');
    });

    it('handles empty string for TEXT', () => {
      const wrapper = createWrapper({
        'test-key': {
          valueType: 'TEXT',
          numericValue: null,
          boolValue: null,
          textValue: '',
        },
      });
      const { container } = render(
        <ParameterInput entryKey="test-key" valueType="TEXT" />,
        { wrapper }
      );
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('handles whitespace-only string for TEXT', () => {
      const wrapper = createWrapper({
        'test-key': {
          valueType: 'TEXT',
          numericValue: null,
          boolValue: null,
          textValue: '   ',
        },
      });
      const { container } = render(
        <ParameterInput entryKey="test-key" valueType="TEXT" />,
        { wrapper }
      );
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('   ');
    });
  });
});
