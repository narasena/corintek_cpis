'use client';

import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { TEntryState } from '../types';

type TEntryStateContextValue = {
  entryState: Record<string, TEntryState>;
  setEntryState: Dispatch<SetStateAction<Record<string, TEntryState>>>;
  getEntry: (key: string) => TEntryState | undefined;
  updateNumber: (key: string, value: string) => void;
  updateBoolean: (key: string, value: boolean | null) => void;
  updateText: (key: string, value: string) => void;
  updateCamera: (
    key: string,
    fileUrl: string | null,
    file: File | null
  ) => void;
};

const EntryStateContext = createContext<TEntryStateContextValue | null>(null);

export function EntryStateProvider({
  children,
  entryState,
  setEntryState,
}: {
  children: ReactNode;
  entryState: Record<string, TEntryState>;
  setEntryState: Dispatch<SetStateAction<Record<string, TEntryState>>>;
}) {
  const getEntry = useCallback((key: string) => entryState[key], [entryState]);

  const updateNumber = useCallback(
    (entryKey: string, rawValue: string) => {
      setEntryState(prev => ({
        ...prev,
        [entryKey]: {
          ...prev[entryKey],
          valueType: 'NUMBER' as const,
          numericValue: rawValue === '' ? null : Number(rawValue),
        },
      }));
    },
    [setEntryState]
  );

  const updateBoolean = useCallback(
    (entryKey: string, boolValue: boolean | null) => {
      setEntryState(prev => ({
        ...prev,
        [entryKey]: {
          valueType: 'BOOLEAN' as const,
          boolValue,
          numericValue: null,
          textValue: null,
        },
      }));
    },
    [setEntryState]
  );

  const updateText = useCallback(
    (entryKey: string, textValue: string) => {
      setEntryState(prev => ({
        ...prev,
        [entryKey]: {
          valueType: 'TEXT' as const,
          textValue,
          numericValue: null,
          boolValue: null,
        },
      }));
    },
    [setEntryState]
  );

  const updateCamera = useCallback(
    (entryKey: string, fileUrl: string | null, file: File | null) => {
      setEntryState(prev => ({
        ...prev,
        [entryKey]: {
          valueType: 'NUMBER' as const,
          numericValue: prev[entryKey]?.numericValue ?? null,
          boolValue: prev[entryKey]?.boolValue ?? null,
          textValue: prev[entryKey]?.textValue ?? null,
          fileUrl,
          pendingFile: file,
        },
      }));
    },
    [setEntryState]
  );

  return (
    <EntryStateContext.Provider
      value={{
        entryState,
        setEntryState,
        getEntry,
        updateNumber,
        updateBoolean,
        updateText,
        updateCamera,
      }}
    >
      {children}
    </EntryStateContext.Provider>
  );
}

export function useEntryStateContext() {
  const context = useContext(EntryStateContext);
  if (!context) {
    throw new Error(
      'useEntryStateContext must be used within an EntryStateProvider'
    );
  }
  return context;
}
