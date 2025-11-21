import { ValueType } from '@/features/api/generated/prisma/enums';
import { preprocessBlank } from '@/features/schemas/defaultSchema';
import { z } from 'zod';

export const parameterLimitSchema = z.object({
  parameterId: z.string().min(1, 'Parameter ID harus diisi'),
  methodId: z.string().nullable().optional(),
  groupId: z.string().nullable().optional(),
  valueType: z.enum(ValueType),
  minValue: preprocessBlank(z.string().nullable().optional()),
  maxValue: preprocessBlank(z.string().nullable().optional()),
  booleanValue: z.boolean().nullable().optional(),
  textValue: preprocessBlank(z.string().nullable().optional()),
});
