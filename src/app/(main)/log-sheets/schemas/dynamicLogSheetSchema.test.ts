import { describe, it, expect } from 'vitest';
import { createDynamicLogSheetSchema } from '@/app/(main)/log-sheets/schemas/dynamicLogSheetSchema';
import { IParameterGroupForSchema } from '@/types/log-sheet.type';
import { ValueType } from '@/features/api/generated/prisma/enums';

describe('Dynamic Log Sheet Schema', () => {
  const mockParameterGroups: IParameterGroupForSchema[] = [
    {
      id: 'group-1',
      name: 'Temperature Group',
      description: 'Temperature measurements',
      members: [
        {
          parameter: {
            id: 'temp-1',
            name: 'Inlet Temperature',
            valueType: ValueType.NUMBER,
            unit: '°C',
            description: 'Inlet temperature measurement',
          },
        },
        {
          parameter: {
            id: 'running-1',
            name: 'System Running',
            valueType: ValueType.BOOLEAN,
            description: 'Whether the system is running',
          },
        },
        {
          parameter: {
            id: 'notes-1',
            name: 'Observations',
            valueType: ValueType.TEXT,
            description: 'General observations',
          },
        },
      ],
    },
    {
      id: 'group-2',
      name: 'Pressure Group',
      description: 'Pressure measurements',
      members: [
        {
          parameter: {
            id: 'pressure-1',
            name: 'System Pressure',
            valueType: ValueType.NUMBER,
            unit: 'bar',
            description: 'System pressure measurement',
          },
        },
      ],
    },
  ];

  describe('createDynamicLogSheetSchema', () => {
    it('should create a valid schema with parameter groups', () => {
      // Act
      const schema = createDynamicLogSheetSchema(mockParameterGroups);

      // Assert
      expect(schema).toBeDefined();
      expect(typeof schema.parse).toBe('function');
    });

    it('should validate valid log sheet data', () => {
      // Arrange
      const schema = createDynamicLogSheetSchema(mockParameterGroups);
      const validData = {
        date: '2024-01-15',
        notes: 'Test log sheet',
        chemicalUsageData: [
          { id: 'chemical-1', quantity: 10 },
          { id: 'chemical-2', quantity: 5 },
        ],
        'group-1': {
          'temp-1': 25.5,
          'running-1': true,
          'notes-1': 'All systems normal',
        },
        'group-2': {
          'pressure-1': 2.5,
        },
      };

      // Act & Assert
      expect(() => schema.parse(validData)).not.toThrow();
      const result = schema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject data with missing required date', () => {
      // Arrange
      const schema = createDynamicLogSheetSchema(mockParameterGroups);
      const invalidData = {
        notes: 'Test log sheet',
        chemicalUsageData: [],
        'group-1': {
          'temp-1': 25.5,
        },
      };

      // Act & Assert
      expect(() => schema.parse(invalidData)).toThrow();
    });

    it('should reject data with empty date', () => {
      // Arrange
      const schema = createDynamicLogSheetSchema(mockParameterGroups);
      const invalidData = {
        date: '',
        notes: 'Test log sheet',
        chemicalUsageData: [],
        'group-1': {
          'temp-1': 25.5,
        },
      };

      // Act & Assert
      expect(() => schema.parse(invalidData)).toThrow('Date is required');
    });

    it('should reject data with invalid date format', () => {
      // Arrange
      const schema = createDynamicLogSheetSchema(mockParameterGroups);
      const invalidData = {
        date: 'invalid-date',
        notes: 'Test log sheet',
        chemicalUsageData: [],
        'group-1': {
          'temp-1': 25.5,
        },
      };

      // Act & Assert
      expect(() => schema.parse(invalidData)).toThrow('Invalid date format');
    });

    it('should accept valid date formats', () => {
      // Arrange
      const schema = createDynamicLogSheetSchema(mockParameterGroups);
      const validDates = [
        '2024-01-15',
        '2024-12-31',
        '2023-06-15T10:30:00Z',
        '2024-01-01T00:00:00.000Z',
      ];

      // Act & Assert
      validDates.forEach(date => {
        const data = {
          date,
          notes: 'Test',
          chemicalUsageData: [],
          'group-1': { 'temp-1': 25 },
          'group-2': { 'pressure-1': 2 },
        };
        expect(() => schema.parse(data)).not.toThrow();
      });
    });

    it('should reject negative numbers for NUMBER parameters', () => {
      // Arrange
      const schema = createDynamicLogSheetSchema(mockParameterGroups);
      const invalidData = {
        date: '2024-01-15',
        notes: 'Test log sheet',
        chemicalUsageData: [],
        'group-1': {
          'temp-1': -10, // Negative number should be rejected
        },
      };

      // Act & Assert
      expect(() => schema.parse(invalidData)).toThrow(
        'Value cannot be negative'
      );
    });

    it('should accept backdated entries', () => {
      // Arrange
      const schema = createDynamicLogSheetSchema(mockParameterGroups);
      const backdatedData = {
        date: '2023-01-01', // Backdated
        notes: 'Backdated entry',
        chemicalUsageData: [],
        'group-1': {
          'temp-1': 25.5,
        },
      };

      // Act & Assert
      expect(() => schema.parse(backdatedData)).not.toThrow();
      const result = schema.parse(backdatedData);
      expect(result.date).toBe('2023-01-01');
    });

    it('should accept future dates', () => {
      // Arrange
      const schema = createDynamicLogSheetSchema(mockParameterGroups);
      const futureData = {
        date: '2025-12-31', // Future date
        notes: 'Future entry',
        chemicalUsageData: [],
        'group-1': {
          'temp-1': 25.5,
        },
      };

      // Act & Assert
      expect(() => schema.parse(futureData)).not.toThrow();
      const result = schema.parse(futureData);
      expect(result.date).toBe('2025-12-31');
    });
  });
});
