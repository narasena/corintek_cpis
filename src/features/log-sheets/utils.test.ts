import { describe, expect, it } from 'vitest';
import { entryKeys, makeEntryKey } from './utils';

describe('entryKeys', () => {
  describe('value', () => {
    it('generates VALUE key with machineId', () => {
      const key = entryKeys.value('param-1', 'machine-1');
      expect(key).toBe('param-1:machine-1:VALUE');
    });

    it('generates VALUE key with null machineId', () => {
      const key = entryKeys.value('param-1', null);
      expect(key).toBe('param-1:null:VALUE');
    });

    it('handles empty string parameterId', () => {
      const key = entryKeys.value('', 'machine-1');
      expect(key).toBe(':machine-1:VALUE');
    });

    it('handles UUID-like parameterId', () => {
      const key = entryKeys.value(
        '550e8400-e29b-41d4-a716-446655440000',
        'machine-1'
      );
      expect(key).toContain('550e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('rawWater', () => {
    it('generates RAW_WATER key with null machineId', () => {
      const key = entryKeys.rawWater('param-1');
      expect(key).toBe('param-1:null:RAW_WATER');
    });

    it('always uses null for machineId', () => {
      const key = entryKeys.rawWater('param-1');
      expect(key).toContain(':null:');
    });
  });

  describe('note', () => {
    it('generates NOTE key with null machineId', () => {
      const key = entryKeys.note('param-1');
      expect(key).toBe('param-1:null:NOTE');
    });

    it('always uses null for machineId', () => {
      const key = entryKeys.note('param-1');
      expect(key).toContain(':null:');
    });
  });

  describe('consistency with makeEntryKey', () => {
    it('value matches makeEntryKey with VALUE role', () => {
      const paramId = 'param-1';
      const machineId = 'machine-1';
      expect(entryKeys.value(paramId, machineId)).toBe(
        makeEntryKey(paramId, machineId, 'VALUE')
      );
    });

    it('rawWater matches makeEntryKey with RAW_WATER role', () => {
      const paramId = 'param-1';
      expect(entryKeys.rawWater(paramId)).toBe(
        makeEntryKey(paramId, null, 'RAW_WATER')
      );
    });

    it('note matches makeEntryKey with NOTE role', () => {
      const paramId = 'param-1';
      expect(entryKeys.note(paramId)).toBe(makeEntryKey(paramId, null, 'NOTE'));
    });
  });

  describe('edge cases', () => {
    it('handles special characters in parameterId', () => {
      const key = entryKeys.value('param-with-dashes', 'machine-1');
      expect(key).toBe('param-with-dashes:machine-1:VALUE');
    });

    it('handles numeric string parameterId', () => {
      const key = entryKeys.value('12345', 'machine-1');
      expect(key).toBe('12345:machine-1:VALUE');
    });

    it('handles numeric string machineId', () => {
      const key = entryKeys.value('param-1', '12345');
      expect(key).toBe('param-1:12345:VALUE');
    });
  });
});
