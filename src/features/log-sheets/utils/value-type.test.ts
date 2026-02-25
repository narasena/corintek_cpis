import { describe, expect, it } from 'vitest';
import {
  isEntryValueEmpty,
  isEntryValueComplete,
  getTypedValue,
  createEmptyEntryState,
  isNumericInRange,
} from './value-type';

describe('isEntryValueEmpty', () => {
  describe('NUMBER', () => {
    it('returns true for null', () => {
      expect(
        isEntryValueEmpty({ valueType: 'NUMBER', numericValue: null })
      ).toBe(true);
    });
    it('returns true for undefined', () => {
      expect(isEntryValueEmpty({ valueType: 'NUMBER' })).toBe(true);
    });
    it('returns false for 0', () => {
      expect(isEntryValueEmpty({ valueType: 'NUMBER', numericValue: 0 })).toBe(
        false
      );
    });
    it('returns false for positive value', () => {
      expect(isEntryValueEmpty({ valueType: 'NUMBER', numericValue: 42 })).toBe(
        false
      );
    });
    it('returns false for negative value', () => {
      expect(
        isEntryValueEmpty({ valueType: 'NUMBER', numericValue: -100 })
      ).toBe(false);
    });
    it('returns false for NaN', () => {
      expect(
        isEntryValueEmpty({ valueType: 'NUMBER', numericValue: NaN })
      ).toBe(false);
    });
  });

  describe('BOOLEAN', () => {
    it('returns true for null', () => {
      expect(isEntryValueEmpty({ valueType: 'BOOLEAN', boolValue: null })).toBe(
        true
      );
    });
    it('returns true for undefined', () => {
      expect(isEntryValueEmpty({ valueType: 'BOOLEAN' })).toBe(true);
    });
    it('returns false for false', () => {
      expect(
        isEntryValueEmpty({ valueType: 'BOOLEAN', boolValue: false })
      ).toBe(false);
    });
    it('returns false for true', () => {
      expect(isEntryValueEmpty({ valueType: 'BOOLEAN', boolValue: true })).toBe(
        false
      );
    });
  });

  describe('TEXT', () => {
    it('returns true for null', () => {
      expect(isEntryValueEmpty({ valueType: 'TEXT', textValue: null })).toBe(
        true
      );
    });
    it('returns true for undefined', () => {
      expect(isEntryValueEmpty({ valueType: 'TEXT' })).toBe(true);
    });
    it('returns true for empty string', () => {
      expect(isEntryValueEmpty({ valueType: 'TEXT', textValue: '' })).toBe(
        true
      );
    });
    it('returns true for whitespace only', () => {
      expect(isEntryValueEmpty({ valueType: 'TEXT', textValue: '   ' })).toBe(
        true
      );
    });
    it('returns true for tab/newline only', () => {
      expect(isEntryValueEmpty({ valueType: 'TEXT', textValue: '\t\n' })).toBe(
        true
      );
    });
    it('returns false for content', () => {
      expect(isEntryValueEmpty({ valueType: 'TEXT', textValue: 'text' })).toBe(
        false
      );
    });
    it('returns false for content with whitespace', () => {
      expect(
        isEntryValueEmpty({ valueType: 'TEXT', textValue: '  text  ' })
      ).toBe(false);
    });
  });

  describe('fileUrl override', () => {
    it('returns false when fileUrl present with null numericValue', () => {
      expect(
        isEntryValueEmpty({
          valueType: 'NUMBER',
          numericValue: null,
          fileUrl: 'url',
        })
      ).toBe(false);
    });
    it('returns false when fileUrl present with null textValue', () => {
      expect(
        isEntryValueEmpty({
          valueType: 'TEXT',
          textValue: null,
          fileUrl: 'url',
        })
      ).toBe(false);
    });
    it('returns true when fileUrl is empty string', () => {
      expect(
        isEntryValueEmpty({
          valueType: 'NUMBER',
          numericValue: null,
          fileUrl: '',
        })
      ).toBe(true);
    });
  });

  describe('undefined entry', () => {
    it('returns true for undefined', () => {
      expect(isEntryValueEmpty(undefined)).toBe(true);
    });
  });

  describe('unknown valueType', () => {
    it('returns true for unknown valueType without fileUrl', () => {
      expect(isEntryValueEmpty({ valueType: 'UNKNOWN' as any })).toBe(true);
    });
  });
});

describe('isEntryValueComplete', () => {
  describe('NUMBER', () => {
    it('returns true for valid number', () => {
      expect(
        isEntryValueComplete({ valueType: 'NUMBER', numericValue: 42 })
      ).toBe(true);
    });
    it('returns true for 0', () => {
      expect(
        isEntryValueComplete({ valueType: 'NUMBER', numericValue: 0 })
      ).toBe(true);
    });
    it('returns true for negative number', () => {
      expect(
        isEntryValueComplete({ valueType: 'NUMBER', numericValue: -100 })
      ).toBe(true);
    });
    it('returns false for null', () => {
      expect(
        isEntryValueComplete({ valueType: 'NUMBER', numericValue: null })
      ).toBe(false);
    });
    it('returns false for undefined', () => {
      expect(isEntryValueComplete({ valueType: 'NUMBER' })).toBe(false);
    });
    it('returns false for NaN', () => {
      expect(
        isEntryValueComplete({ valueType: 'NUMBER', numericValue: NaN })
      ).toBe(false);
    });
  });

  describe('BOOLEAN', () => {
    it('returns true for true', () => {
      expect(
        isEntryValueComplete({ valueType: 'BOOLEAN', boolValue: true })
      ).toBe(true);
    });
    it('returns true for false', () => {
      expect(
        isEntryValueComplete({ valueType: 'BOOLEAN', boolValue: false })
      ).toBe(true);
    });
    it('returns false for null', () => {
      expect(
        isEntryValueComplete({ valueType: 'BOOLEAN', boolValue: null })
      ).toBe(false);
    });
    it('returns false for undefined', () => {
      expect(isEntryValueComplete({ valueType: 'BOOLEAN' })).toBe(false);
    });
  });

  describe('TEXT', () => {
    it('returns true for content', () => {
      expect(
        isEntryValueComplete({ valueType: 'TEXT', textValue: 'text' })
      ).toBe(true);
    });
    it('returns true for content with whitespace', () => {
      expect(
        isEntryValueComplete({ valueType: 'TEXT', textValue: '  text  ' })
      ).toBe(true);
    });
    it('returns false for null', () => {
      expect(isEntryValueComplete({ valueType: 'TEXT', textValue: null })).toBe(
        false
      );
    });
    it('returns false for empty string', () => {
      expect(isEntryValueComplete({ valueType: 'TEXT', textValue: '' })).toBe(
        false
      );
    });
    it('returns false for whitespace only', () => {
      expect(
        isEntryValueComplete({ valueType: 'TEXT', textValue: '   ' })
      ).toBe(false);
    });
  });

  describe('undefined entry', () => {
    it('returns false for undefined', () => {
      expect(isEntryValueComplete(undefined)).toBe(false);
    });
  });
});

describe('getTypedValue', () => {
  it('returns numericValue for NUMBER', () => {
    expect(getTypedValue({ valueType: 'NUMBER', numericValue: 42 })).toBe(42);
  });
  it('returns null for NUMBER with null value', () => {
    expect(getTypedValue({ valueType: 'NUMBER', numericValue: null })).toBe(
      null
    );
  });
  it('returns boolValue for BOOLEAN', () => {
    expect(getTypedValue({ valueType: 'BOOLEAN', boolValue: true })).toBe(true);
  });
  it('returns boolValue false for BOOLEAN', () => {
    expect(getTypedValue({ valueType: 'BOOLEAN', boolValue: false })).toBe(
      false
    );
  });
  it('returns textValue for TEXT', () => {
    expect(getTypedValue({ valueType: 'TEXT', textValue: 'text' })).toBe(
      'text'
    );
  });
  it('returns null for undefined entry', () => {
    expect(getTypedValue(undefined)).toBe(null);
  });
});

describe('createEmptyEntryState', () => {
  it('creates empty NUMBER state', () => {
    expect(createEmptyEntryState('NUMBER')).toEqual({
      valueType: 'NUMBER',
      numericValue: null,
    });
  });
  it('creates empty BOOLEAN state', () => {
    expect(createEmptyEntryState('BOOLEAN')).toEqual({
      valueType: 'BOOLEAN',
      boolValue: null,
    });
  });
  it('creates empty TEXT state', () => {
    expect(createEmptyEntryState('TEXT')).toEqual({
      valueType: 'TEXT',
      textValue: null,
    });
  });
});

describe('isNumericInRange', () => {
  it('returns true for null value', () => {
    expect(isNumericInRange(null, 0, 100)).toBe(true);
  });
  it('returns true for undefined value', () => {
    expect(isNumericInRange(undefined, 0, 100)).toBe(true);
  });
  it('returns true for value in range', () => {
    expect(isNumericInRange(50, 0, 100)).toBe(true);
  });
  it('returns true for value at min bound', () => {
    expect(isNumericInRange(0, 0, 100)).toBe(true);
  });
  it('returns true for value at max bound', () => {
    expect(isNumericInRange(100, 0, 100)).toBe(true);
  });
  it('returns false for value below min', () => {
    expect(isNumericInRange(-1, 0, 100)).toBe(false);
  });
  it('returns false for value above max', () => {
    expect(isNumericInRange(101, 0, 100)).toBe(false);
  });
  it('returns true when no bounds set', () => {
    expect(isNumericInRange(999, null, null)).toBe(true);
  });
  it('returns true when only min set and value above', () => {
    expect(isNumericInRange(50, 0, null)).toBe(true);
  });
  it('returns false when only min set and value below', () => {
    expect(isNumericInRange(-1, 0, null)).toBe(false);
  });
  it('returns true when only max set and value below', () => {
    expect(isNumericInRange(50, null, 100)).toBe(true);
  });
  it('returns false when only max set and value above', () => {
    expect(isNumericInRange(101, null, 100)).toBe(false);
  });
});
