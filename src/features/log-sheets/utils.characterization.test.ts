import { describe, expect, it } from 'vitest';

import {
  makeEntryKey,
  isLogSheetEntryEmpty,
} from '@/features/log-sheets/utils';

describe('makeEntryKey (characterization)', () => {
  it('creates key with all parameters provided', () => {
    const result = makeEntryKey('param-1', 'machine-1', 'VALUE');
    expect(result).toBe('param-1:machine-1:VALUE');
  });

  it('uses "null" string when machineId is null', () => {
    const result = makeEntryKey('param-1', null, 'RAW_WATER');
    expect(result).toBe('param-1:null:RAW_WATER');
  });

  it('handles all role types', () => {
    expect(makeEntryKey('p', 'm', 'VALUE')).toBe('p:m:VALUE');
    expect(makeEntryKey('p', 'm', 'RAW_WATER')).toBe('p:m:RAW_WATER');
    expect(makeEntryKey('p', 'm', 'NOTE')).toBe('p:m:NOTE');
  });

  it('handles UUID-like parameter and machine IDs', () => {
    const paramId = '123e4567-e89b-12d3-a456-426614174000';
    const machineId = '123e4567-e89b-12d3-a456-426614174001';
    const result = makeEntryKey(paramId, machineId, 'VALUE');
    expect(result).toBe(`${paramId}:${machineId}:VALUE`);
  });

  it('handles null machineId with UUID parameter', () => {
    const paramId = '123e4567-e89b-12d3-a456-426614174000';
    const result = makeEntryKey(paramId, null, 'VALUE');
    expect(result).toBe(`${paramId}:null:VALUE`);
  });
});

describe('isLogSheetEntryEmpty (characterization)', () => {
  describe('NUMBER valueType', () => {
    it('returns true when numericValue is null', () => {
      expect(
        isLogSheetEntryEmpty({ valueType: 'NUMBER', numericValue: null })
      ).toBe(true);
    });

    it('returns true when numericValue is undefined', () => {
      expect(isLogSheetEntryEmpty({ valueType: 'NUMBER' })).toBe(true);
    });

    it('returns false when numericValue is 0 (edge case: zero is valid)', () => {
      expect(
        isLogSheetEntryEmpty({ valueType: 'NUMBER', numericValue: 0 })
      ).toBe(false);
    });

    it('returns false when numericValue is negative', () => {
      expect(
        isLogSheetEntryEmpty({ valueType: 'NUMBER', numericValue: -100 })
      ).toBe(false);
    });

    it('returns false when numericValue is positive', () => {
      expect(
        isLogSheetEntryEmpty({ valueType: 'NUMBER', numericValue: 42 })
      ).toBe(false);
    });

    it('returns false when numericValue is NaN (SURPRISING: NaN is considered valid)', () => {
      expect(
        isLogSheetEntryEmpty({ valueType: 'NUMBER', numericValue: NaN })
      ).toBe(false);
    });

    it('returns false when numericValue is Infinity', () => {
      expect(
        isLogSheetEntryEmpty({ valueType: 'NUMBER', numericValue: Infinity })
      ).toBe(false);
    });

    it('returns false when numericValue is -Infinity', () => {
      expect(
        isLogSheetEntryEmpty({ valueType: 'NUMBER', numericValue: -Infinity })
      ).toBe(false);
    });

    it('returns false when numericValue is very small decimal', () => {
      expect(
        isLogSheetEntryEmpty({ valueType: 'NUMBER', numericValue: 0.0000001 })
      ).toBe(false);
    });
  });

  describe('BOOLEAN valueType', () => {
    it('returns true when boolValue is null', () => {
      expect(
        isLogSheetEntryEmpty({ valueType: 'BOOLEAN', boolValue: null })
      ).toBe(true);
    });

    it('returns true when boolValue is undefined', () => {
      expect(isLogSheetEntryEmpty({ valueType: 'BOOLEAN' })).toBe(true);
    });

    it('returns false when boolValue is true', () => {
      expect(
        isLogSheetEntryEmpty({ valueType: 'BOOLEAN', boolValue: true })
      ).toBe(false);
    });

    it('returns false when boolValue is false (edge case: false is valid)', () => {
      expect(
        isLogSheetEntryEmpty({ valueType: 'BOOLEAN', boolValue: false })
      ).toBe(false);
    });
  });

  describe('TEXT valueType', () => {
    it('returns true when textValue is null', () => {
      expect(isLogSheetEntryEmpty({ valueType: 'TEXT', textValue: null })).toBe(
        true
      );
    });

    it('returns true when textValue is undefined', () => {
      expect(isLogSheetEntryEmpty({ valueType: 'TEXT' })).toBe(true);
    });

    it('returns true when textValue is empty string', () => {
      expect(isLogSheetEntryEmpty({ valueType: 'TEXT', textValue: '' })).toBe(
        true
      );
    });

    it('returns true when textValue is whitespace-only string', () => {
      expect(
        isLogSheetEntryEmpty({ valueType: 'TEXT', textValue: '   ' })
      ).toBe(true);
    });

    it('returns true when textValue is tab/newline only', () => {
      expect(
        isLogSheetEntryEmpty({ valueType: 'TEXT', textValue: '\t\n' })
      ).toBe(true);
    });

    it('returns false when textValue has content', () => {
      expect(
        isLogSheetEntryEmpty({ valueType: 'TEXT', textValue: 'some text' })
      ).toBe(false);
    });

    it('returns false when textValue has content with surrounding whitespace', () => {
      expect(
        isLogSheetEntryEmpty({ valueType: 'TEXT', textValue: '  text  ' })
      ).toBe(false);
    });
  });

  describe('fileUrl override (SURPRISING BEHAVIOR)', () => {
    it('returns false when fileUrl is present, regardless of valueType and other values', () => {
      expect(
        isLogSheetEntryEmpty({
          valueType: 'NUMBER',
          numericValue: null,
          fileUrl: 'https://example.com/file.pdf',
        })
      ).toBe(false);
    });

    it('returns false when fileUrl is present even with empty text', () => {
      expect(
        isLogSheetEntryEmpty({
          valueType: 'TEXT',
          textValue: null,
          fileUrl: 'https://example.com/file.pdf',
        })
      ).toBe(false);
    });

    it('returns false when fileUrl is empty string (SURPRISING: empty string is truthy check)', () => {
      expect(
        isLogSheetEntryEmpty({
          valueType: 'NUMBER',
          numericValue: null,
          fileUrl: '',
        })
      ).toBe(true);
    });
  });

  describe('unknown valueType', () => {
    it('returns true for unknown valueType without fileUrl', () => {
      expect(isLogSheetEntryEmpty({ valueType: 'UNKNOWN' as any })).toBe(true);
    });

    it('returns false for unknown valueType with fileUrl', () => {
      expect(
        isLogSheetEntryEmpty({
          valueType: 'UNKNOWN' as any,
          fileUrl: 'https://example.com/file.pdf',
        })
      ).toBe(false);
    });
  });

  describe('mixed value scenarios', () => {
    it('NUMBER entry ignores boolValue and textValue', () => {
      expect(
        isLogSheetEntryEmpty({
          valueType: 'NUMBER',
          numericValue: null,
          boolValue: true,
          textValue: 'text',
        })
      ).toBe(true);
    });

    it('BOOLEAN entry ignores numericValue and textValue', () => {
      expect(
        isLogSheetEntryEmpty({
          valueType: 'BOOLEAN',
          boolValue: null,
          numericValue: 42,
          textValue: 'text',
        })
      ).toBe(true);
    });

    it('TEXT entry ignores numericValue and boolValue', () => {
      expect(
        isLogSheetEntryEmpty({
          valueType: 'TEXT',
          textValue: null,
          numericValue: 42,
          boolValue: true,
        })
      ).toBe(true);
    });
  });
});
