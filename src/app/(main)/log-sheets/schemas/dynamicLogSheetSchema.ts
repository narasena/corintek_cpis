import { ValueType } from '@/features/api/generated/prisma/enums';
import {
  preprocessBlank,
  preprocessBoolean,
} from '@/features/schemas/defaultSchema';

import { IParameterGroupForSchema } from '@/types/log-sheet.type';
import z from 'zod';

const chemicalUsageSchema = z.object({
  id: z.string(),
  quantity: z.number(),
});

// Dynamic schema generator based on parameter groups
export const createDynamicLogSheetSchema = (
  parameterGroups: IParameterGroupForSchema[]
) => {
  const schemaFields: Record<string, z.ZodSchema> = {};

  parameterGroups.forEach(group => {
    const groupSchema: Record<string, z.ZodSchema> = {};

    (group.members || []).forEach(member => {
      const param = member.parameter;
      let fieldSchema: z.ZodSchema;

      switch (param.valueType) {
        case ValueType.NUMBER:
          fieldSchema = z.number().min(0, 'Value cannot be negative');
          break;
        case ValueType.BOOLEAN:
          fieldSchema = preprocessBoolean(z.boolean());
          break;
        case ValueType.TEXT:
          fieldSchema = preprocessBlank(z.string().nullable().optional());
          break;
        default:
          // Fallback for unknown value types - use string
          fieldSchema = z.string().nullable().optional();
      }

      groupSchema[param.id] = fieldSchema;
    });

    // Since API groups are already unit-specific, treat all groups as flat structures
    schemaFields[group.id] = z.object(groupSchema);
  });

  // Add date, chemical usage and notes
  schemaFields.date = z
    .string()
    .min(1, 'Date is required')
    .refine(
      date => {
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
      },
      {
        message: 'Invalid date format',
      }
    );
  schemaFields.chemicalUsageData = z.array(chemicalUsageSchema);
  schemaFields.notes = preprocessBlank(z.string().nullable().optional());

  return z.object(schemaFields);
};
