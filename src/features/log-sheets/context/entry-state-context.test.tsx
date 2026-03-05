// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement, useState } from 'react';
import {
  EntryStateProvider,
  useEntryStateContext,
} from './entry-state-context';
import type { TEntryState } from '../types';

function wrapper({ children }: { children: React.ReactNode }) {
  const [entryState, setEntryState] = useState<Record<string, TEntryState>>({});
  return createElement(EntryStateProvider, {
    entryState,
    setEntryState,
    children,
  });
}

describe('EntryStateContext', () => {
  it('throws error when used outside provider', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(() => renderHook(() => useEntryStateContext())).toThrow(
      'useEntryStateContext must be used within an EntryStateProvider'
    );
    consoleError.mockRestore();
  });

  it('provides entryState and setEntryState', () => {
    const { result } = renderHook(() => useEntryStateContext(), { wrapper });
    expect(result.current.entryState).toEqual({});
    expect(typeof result.current.setEntryState).toBe('function');
  });

  it('getEntry returns undefined for missing key', () => {
    const { result } = renderHook(() => useEntryStateContext(), { wrapper });
    expect(result.current.getEntry('missing-key')).toBeUndefined();
  });

  it('updateNumber sets numeric value', () => {
    const { result } = renderHook(() => useEntryStateContext(), { wrapper });
    act(() => {
      result.current.updateNumber('test-key', '42');
    });
    const entry = result.current.getEntry('test-key');
    expect(entry?.valueType).toBe('NUMBER');
    expect(entry?.numericValue).toBe(42);
  });

  it('updateNumber sets null for empty string', () => {
    const { result } = renderHook(() => useEntryStateContext(), { wrapper });
    act(() => {
      result.current.updateNumber('test-key', '');
    });
    const entry = result.current.getEntry('test-key');
    expect(entry?.valueType).toBe('NUMBER');
    expect(entry?.numericValue).toBeNull();
  });

  it('updateNumber handles zero value', () => {
    const { result } = renderHook(() => useEntryStateContext(), { wrapper });
    act(() => {
      result.current.updateNumber('test-key', '0');
    });
    const entry = result.current.getEntry('test-key');
    expect(entry?.valueType).toBe('NUMBER');
    expect(entry?.numericValue).toBe(0);
  });

  it('updateBoolean sets boolean value', () => {
    const { result } = renderHook(() => useEntryStateContext(), { wrapper });
    act(() => {
      result.current.updateBoolean('test-key', true);
    });
    expect(result.current.getEntry('test-key')).toEqual({
      valueType: 'BOOLEAN',
      boolValue: true,
      numericValue: null,
      textValue: null,
    });
  });

  it('updateBoolean sets false', () => {
    const { result } = renderHook(() => useEntryStateContext(), { wrapper });
    act(() => {
      result.current.updateBoolean('test-key', false);
    });
    expect(result.current.getEntry('test-key')).toEqual({
      valueType: 'BOOLEAN',
      boolValue: false,
      numericValue: null,
      textValue: null,
    });
  });

  it('updateBoolean sets null', () => {
    const { result } = renderHook(() => useEntryStateContext(), { wrapper });
    act(() => {
      result.current.updateBoolean('test-key', null);
    });
    expect(result.current.getEntry('test-key')).toEqual({
      valueType: 'BOOLEAN',
      boolValue: null,
      numericValue: null,
      textValue: null,
    });
  });

  it('updateText sets text value', () => {
    const { result } = renderHook(() => useEntryStateContext(), { wrapper });
    act(() => {
      result.current.updateText('test-key', 'hello');
    });
    expect(result.current.getEntry('test-key')).toEqual({
      valueType: 'TEXT',
      textValue: 'hello',
      numericValue: null,
      boolValue: null,
    });
  });

  it('updateText sets empty string', () => {
    const { result } = renderHook(() => useEntryStateContext(), { wrapper });
    act(() => {
      result.current.updateText('test-key', '');
    });
    expect(result.current.getEntry('test-key')).toEqual({
      valueType: 'TEXT',
      textValue: '',
      numericValue: null,
      boolValue: null,
    });
  });

  it('updateCamera sets fileUrl and pendingFile', () => {
    const { result } = renderHook(() => useEntryStateContext(), { wrapper });
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    act(() => {
      result.current.updateCamera(
        'test-key',
        'https://example.com/file.jpg',
        mockFile
      );
    });
    expect(result.current.getEntry('test-key')).toEqual({
      valueType: 'NUMBER',
      numericValue: null,
      boolValue: null,
      textValue: null,
      fileUrl: 'https://example.com/file.jpg',
      pendingFile: mockFile,
    });
  });

  it('updateCamera preserves existing numericValue', () => {
    const { result } = renderHook(() => useEntryStateContext(), { wrapper });
    act(() => {
      result.current.updateNumber('test-key', '100');
    });
    act(() => {
      result.current.updateCamera(
        'test-key',
        'https://example.com/file.jpg',
        null
      );
    });
    expect(result.current.getEntry('test-key')).toEqual({
      valueType: 'NUMBER',
      numericValue: 100,
      boolValue: null,
      textValue: null,
      fileUrl: 'https://example.com/file.jpg',
      pendingFile: null,
    });
  });

  it('updateCamera sets null values', () => {
    const { result } = renderHook(() => useEntryStateContext(), { wrapper });
    act(() => {
      result.current.updateCamera('test-key', null, null);
    });
    expect(result.current.getEntry('test-key')).toEqual({
      valueType: 'NUMBER',
      numericValue: null,
      boolValue: null,
      textValue: null,
      fileUrl: null,
      pendingFile: null,
    });
  });

  it('entryState reflects all updates', () => {
    const { result } = renderHook(() => useEntryStateContext(), { wrapper });
    act(() => {
      result.current.updateNumber('key1', '10');
      result.current.updateBoolean('key2', true);
      result.current.updateText('key3', 'text');
    });
    expect(result.current.entryState).toEqual({
      key1: { valueType: 'NUMBER', numericValue: 10 },
      key2: {
        valueType: 'BOOLEAN',
        boolValue: true,
        numericValue: null,
        textValue: null,
      },
      key3: {
        valueType: 'TEXT',
        textValue: 'text',
        numericValue: null,
        boolValue: null,
      },
    });
  });
});
