import { describe, expect, it } from 'vitest';

import {
  LogSheetStatusEnum,
  LogSheetEntryRoleEnum,
  LogSheetPhotoTypeEnum,
  CreateLogSheetSchema,
  UpdateLogSheetSchema,
  CreateLogSheetEntrySchema,
  LogSheetPhotoSchema,
} from '@/features/log-sheets/types';

describe('LogSheetStatusEnum (characterization)', () => {
  it('accepts DRAFT', () => {
    expect(LogSheetStatusEnum.parse('DRAFT')).toBe('DRAFT');
  });

  it('accepts SUBMITTED', () => {
    expect(LogSheetStatusEnum.parse('SUBMITTED')).toBe('SUBMITTED');
  });

  it('accepts APPROVED', () => {
    expect(LogSheetStatusEnum.parse('APPROVED')).toBe('APPROVED');
  });

  it('rejects invalid status', () => {
    expect(() => LogSheetStatusEnum.parse('INVALID')).toThrow();
  });

  it('rejects lowercase status', () => {
    expect(() => LogSheetStatusEnum.parse('draft')).toThrow();
  });

  it('rejects null', () => {
    expect(() => LogSheetStatusEnum.parse(null)).toThrow();
  });

  it('rejects undefined', () => {
    expect(() => LogSheetStatusEnum.parse(undefined)).toThrow();
  });
});

describe('LogSheetEntryRoleEnum (characterization)', () => {
  it('accepts VALUE', () => {
    expect(LogSheetEntryRoleEnum.parse('VALUE')).toBe('VALUE');
  });

  it('accepts RAW_WATER', () => {
    expect(LogSheetEntryRoleEnum.parse('RAW_WATER')).toBe('RAW_WATER');
  });

  it('accepts NOTE', () => {
    expect(LogSheetEntryRoleEnum.parse('NOTE')).toBe('NOTE');
  });

  it('rejects invalid role', () => {
    expect(() => LogSheetEntryRoleEnum.parse('INVALID')).toThrow();
  });

  it('rejects lowercase role', () => {
    expect(() => LogSheetEntryRoleEnum.parse('value')).toThrow();
  });
});

describe('LogSheetPhotoTypeEnum (characterization)', () => {
  it('accepts BEFORE', () => {
    expect(LogSheetPhotoTypeEnum.parse('BEFORE')).toBe('BEFORE');
  });

  it('accepts AFTER', () => {
    expect(LogSheetPhotoTypeEnum.parse('AFTER')).toBe('AFTER');
  });

  it('rejects invalid type', () => {
    expect(() => LogSheetPhotoTypeEnum.parse('DURING')).toThrow();
  });
});

describe('CreateLogSheetSchema (characterization)', () => {
  const validUUID = '123e4567-e89b-12d3-a456-426614174000';

  it('accepts valid minimal input', () => {
    const result = CreateLogSheetSchema.parse({
      projectId: validUUID,
      date: '2024-01-15',
    });
    expect(result.projectId).toBe(validUUID);
    expect(result.date).toBeInstanceOf(Date);
  });

  it('accepts valid full input', () => {
    const result = CreateLogSheetSchema.parse({
      projectId: validUUID,
      date: new Date('2024-01-15'),
      notes: 'Some notes',
      replacedByUserId: validUUID,
    });
    expect(result.notes).toBe('Some notes');
    expect(result.replacedByUserId).toBe(validUUID);
  });

  it('coerces date string to Date object', () => {
    const result = CreateLogSheetSchema.parse({
      projectId: validUUID,
      date: '2024-01-15T10:30:00Z',
    });
    expect(result.date).toBeInstanceOf(Date);
  });

  it('accepts Date object directly (behavior: zod coerces to Date)', async () => {
    const date = new Date('2024-01-15');
    const result = CreateLogSheetSchema.parse({
      projectId: validUUID,
      date,
    });
    expect(result.date).toBeInstanceOf(Date);
    expect(result.date.getTime()).toBe(date.getTime());
  });

  it('rejects invalid projectId (not UUID)', () => {
    expect(() =>
      CreateLogSheetSchema.parse({
        projectId: 'not-a-uuid',
        date: '2024-01-15',
      })
    ).toThrow();
  });

  it('rejects missing projectId', () => {
    expect(() =>
      CreateLogSheetSchema.parse({
        date: '2024-01-15',
      })
    ).toThrow();
  });

  it('rejects missing date', () => {
    expect(() =>
      CreateLogSheetSchema.parse({
        projectId: validUUID,
      })
    ).toThrow();
  });

  it('accepts empty string notes', () => {
    const result = CreateLogSheetSchema.parse({
      projectId: validUUID,
      date: '2024-01-15',
      notes: '',
    });
    expect(result.notes).toBe('');
  });

  it('accepts null replacedByUserId', () => {
    const result = CreateLogSheetSchema.parse({
      projectId: validUUID,
      date: '2024-01-15',
      replacedByUserId: null,
    });
    expect(result.replacedByUserId).toBeNull();
  });

  it('rejects invalid replacedByUserId (not UUID)', () => {
    expect(() =>
      CreateLogSheetSchema.parse({
        projectId: validUUID,
        date: '2024-01-15',
        replacedByUserId: 'not-a-uuid',
      })
    ).toThrow();
  });
});

describe('UpdateLogSheetSchema (characterization)', () => {
  const validUUID = '123e4567-e89b-12d3-a456-426614174000';

  it('requires id', () => {
    expect(() => UpdateLogSheetSchema.parse({})).toThrow();
  });

  it('accepts valid id only', () => {
    const result = UpdateLogSheetSchema.parse({ id: validUUID });
    expect(result.id).toBe(validUUID);
    expect(result.projectId).toBeUndefined();
    expect(result.date).toBeUndefined();
  });

  it('accepts partial update with all optional fields missing', () => {
    const result = UpdateLogSheetSchema.parse({
      id: validUUID,
    });
    expect(result).toEqual({ id: validUUID });
  });

  it('accepts status field', () => {
    const result = UpdateLogSheetSchema.parse({
      id: validUUID,
      status: 'SUBMITTED',
    });
    expect(result.status).toBe('SUBMITTED');
  });

  it('accepts all fields', () => {
    const result = UpdateLogSheetSchema.parse({
      id: validUUID,
      projectId: validUUID,
      date: '2024-01-15',
      notes: 'Updated notes',
      status: 'DRAFT',
      replacedByUserId: validUUID,
    });
    expect(result.id).toBe(validUUID);
    expect(result.status).toBe('DRAFT');
  });

  it('rejects invalid id', () => {
    expect(() => UpdateLogSheetSchema.parse({ id: 'invalid' })).toThrow();
  });

  it('rejects invalid status', () => {
    expect(() =>
      UpdateLogSheetSchema.parse({
        id: validUUID,
        status: 'INVALID',
      })
    ).toThrow();
  });
});

describe('CreateLogSheetEntrySchema (characterization)', () => {
  const validUUID = '123e4567-e89b-12d3-a456-426614174000';

  describe('NUMBER valueType', () => {
    it('accepts valid NUMBER entry with numericValue', () => {
      const result = CreateLogSheetEntrySchema.parse({
        logSheetId: validUUID,
        parameterId: validUUID,
        machineId: validUUID,
        valueType: 'NUMBER',
        numericValue: 42.5,
      });
      expect(result.numericValue).toBe(42.5);
    });

    it('accepts zero as numericValue', () => {
      const result = CreateLogSheetEntrySchema.parse({
        logSheetId: validUUID,
        parameterId: validUUID,
        valueType: 'NUMBER',
        numericValue: 0,
      });
      expect(result.numericValue).toBe(0);
    });

    it('accepts negative numericValue', () => {
      const result = CreateLogSheetEntrySchema.parse({
        logSheetId: validUUID,
        parameterId: validUUID,
        valueType: 'NUMBER',
        numericValue: -10,
      });
      expect(result.numericValue).toBe(-10);
    });

    it('rejects NUMBER entry with null numericValue', () => {
      expect(() =>
        CreateLogSheetEntrySchema.parse({
          logSheetId: validUUID,
          parameterId: validUUID,
          valueType: 'NUMBER',
          numericValue: null,
        })
      ).toThrow();
    });

    it('rejects NUMBER entry with undefined numericValue', () => {
      expect(() =>
        CreateLogSheetEntrySchema.parse({
          logSheetId: validUUID,
          parameterId: validUUID,
          valueType: 'NUMBER',
        })
      ).toThrow();
    });

    it('rejects NaN as numericValue (SURPRISING: Zod validates NaN)', () => {
      expect(() =>
        CreateLogSheetEntrySchema.parse({
          logSheetId: validUUID,
          parameterId: validUUID,
          valueType: 'NUMBER',
          numericValue: NaN,
        })
      ).toThrow();
    });
  });

  describe('BOOLEAN valueType', () => {
    it('accepts BOOLEAN entry with true', () => {
      const result = CreateLogSheetEntrySchema.parse({
        logSheetId: validUUID,
        parameterId: validUUID,
        valueType: 'BOOLEAN',
        boolValue: true,
      });
      expect(result.boolValue).toBe(true);
    });

    it('accepts BOOLEAN entry with false', () => {
      const result = CreateLogSheetEntrySchema.parse({
        logSheetId: validUUID,
        parameterId: validUUID,
        valueType: 'BOOLEAN',
        boolValue: false,
      });
      expect(result.boolValue).toBe(false);
    });

    it('rejects BOOLEAN entry with null boolValue', () => {
      expect(() =>
        CreateLogSheetEntrySchema.parse({
          logSheetId: validUUID,
          parameterId: validUUID,
          valueType: 'BOOLEAN',
          boolValue: null,
        })
      ).toThrow();
    });

    it('rejects BOOLEAN entry with undefined boolValue', () => {
      expect(() =>
        CreateLogSheetEntrySchema.parse({
          logSheetId: validUUID,
          parameterId: validUUID,
          valueType: 'BOOLEAN',
        })
      ).toThrow();
    });
  });

  describe('TEXT valueType', () => {
    it('accepts TEXT entry with textValue', () => {
      const result = CreateLogSheetEntrySchema.parse({
        logSheetId: validUUID,
        parameterId: validUUID,
        valueType: 'TEXT',
        textValue: 'Some text',
      });
      expect(result.textValue).toBe('Some text');
    });

    it('rejects TEXT entry with null textValue', () => {
      expect(() =>
        CreateLogSheetEntrySchema.parse({
          logSheetId: validUUID,
          parameterId: validUUID,
          valueType: 'TEXT',
          textValue: null,
        })
      ).toThrow();
    });

    it('rejects TEXT entry with empty string textValue', () => {
      expect(() =>
        CreateLogSheetEntrySchema.parse({
          logSheetId: validUUID,
          parameterId: validUUID,
          valueType: 'TEXT',
          textValue: '',
        })
      ).toThrow();
    });

    it('rejects TEXT entry with whitespace-only textValue', () => {
      expect(() =>
        CreateLogSheetEntrySchema.parse({
          logSheetId: validUUID,
          parameterId: validUUID,
          valueType: 'TEXT',
          textValue: '   ',
        })
      ).toThrow();
    });

    it('rejects TEXT entry with undefined textValue', () => {
      expect(() =>
        CreateLogSheetEntrySchema.parse({
          logSheetId: validUUID,
          parameterId: validUUID,
          valueType: 'TEXT',
        })
      ).toThrow();
    });
  });

  describe('role field', () => {
    it('defaults role to VALUE when not specified', () => {
      const result = CreateLogSheetEntrySchema.parse({
        logSheetId: validUUID,
        parameterId: validUUID,
        valueType: 'NUMBER',
        numericValue: 1,
      });
      expect(result.role).toBe('VALUE');
    });

    it('accepts RAW_WATER role', () => {
      const result = CreateLogSheetEntrySchema.parse({
        logSheetId: validUUID,
        parameterId: validUUID,
        role: 'RAW_WATER',
        valueType: 'NUMBER',
        numericValue: 7,
      });
      expect(result.role).toBe('RAW_WATER');
    });

    it('accepts NOTE role', () => {
      const result = CreateLogSheetEntrySchema.parse({
        logSheetId: validUUID,
        parameterId: validUUID,
        role: 'NOTE',
        valueType: 'TEXT',
        textValue: 'A note',
      });
      expect(result.role).toBe('NOTE');
    });
  });

  describe('machineId field', () => {
    it('accepts null machineId', () => {
      const result = CreateLogSheetEntrySchema.parse({
        logSheetId: validUUID,
        parameterId: validUUID,
        machineId: null,
        valueType: 'NUMBER',
        numericValue: 1,
      });
      expect(result.machineId).toBeNull();
    });

    it('accepts undefined machineId', () => {
      const result = CreateLogSheetEntrySchema.parse({
        logSheetId: validUUID,
        parameterId: validUUID,
        valueType: 'NUMBER',
        numericValue: 1,
      });
      expect(result.machineId).toBeUndefined();
    });

    it('accepts valid UUID machineId', () => {
      const result = CreateLogSheetEntrySchema.parse({
        logSheetId: validUUID,
        parameterId: validUUID,
        machineId: validUUID,
        valueType: 'NUMBER',
        numericValue: 1,
      });
      expect(result.machineId).toBe(validUUID);
    });
  });

  describe('checkedAt field', () => {
    it('accepts Date object for checkedAt (behavior: zod coerces)', async () => {
      const date = new Date();
      const result = CreateLogSheetEntrySchema.parse({
        logSheetId: validUUID,
        parameterId: validUUID,
        valueType: 'NUMBER',
        numericValue: 1,
        checkedAt: date,
      });
      expect(result.checkedAt).toBeInstanceOf(Date);
    });

    it('coerces date string', () => {
      const result = CreateLogSheetEntrySchema.parse({
        logSheetId: validUUID,
        parameterId: validUUID,
        valueType: 'NUMBER',
        numericValue: 1,
        checkedAt: '2024-01-15T10:30:00Z',
      });
      expect(result.checkedAt).toBeInstanceOf(Date);
    });

    it('accepts null checkedAt', () => {
      const result = CreateLogSheetEntrySchema.parse({
        logSheetId: validUUID,
        parameterId: validUUID,
        valueType: 'NUMBER',
        numericValue: 1,
        checkedAt: null,
      });
      expect(result.checkedAt).toBeNull();
    });
  });
});

describe('LogSheetPhotoSchema (characterization)', () => {
  it('accepts valid photo input', () => {
    const result = LogSheetPhotoSchema.parse({
      type: 'BEFORE',
      url: 'https://example.com/photo.jpg',
    });
    expect(result.type).toBe('BEFORE');
    expect(result.url).toBe('https://example.com/photo.jpg');
  });

  it('accepts optional id', () => {
    const result = LogSheetPhotoSchema.parse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      type: 'AFTER',
      url: 'https://example.com/photo.jpg',
    });
    expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174000');
  });

  it('accepts null caption', () => {
    const result = LogSheetPhotoSchema.parse({
      type: 'BEFORE',
      url: 'https://example.com/photo.jpg',
      caption: null,
    });
    expect(result.caption).toBeNull();
  });

  it('accepts string caption', () => {
    const result = LogSheetPhotoSchema.parse({
      type: 'BEFORE',
      url: 'https://example.com/photo.jpg',
      caption: 'Photo caption',
    });
    expect(result.caption).toBe('Photo caption');
  });

  it('rejects invalid URL', () => {
    expect(() =>
      LogSheetPhotoSchema.parse({
        type: 'BEFORE',
        url: 'not-a-url',
      })
    ).toThrow();
  });

  it('rejects missing URL', () => {
    expect(() =>
      LogSheetPhotoSchema.parse({
        type: 'BEFORE',
      })
    ).toThrow();
  });

  it('rejects invalid type', () => {
    expect(() =>
      LogSheetPhotoSchema.parse({
        type: 'DURING',
        url: 'https://example.com/photo.jpg',
      })
    ).toThrow();
  });

  it('rejects invalid id format', () => {
    expect(() =>
      LogSheetPhotoSchema.parse({
        id: 'not-a-uuid',
        type: 'BEFORE',
        url: 'https://example.com/photo.jpg',
      })
    ).toThrow();
  });
});
