import { ValueType } from '@/features/api/generated/prisma';
import {
  defaultSchemaMessage,
  preprocessBlank,
} from '@/features/schemas/defaultSchema';
import z from 'zod';

export const parameterSchema = z.object({
  name: z.string().min(1).nonempty(defaultSchemaMessage.nonempty),
  valueType: z.enum(ValueType),
  unit: preprocessBlank(z.string().nullable().optional()),
  groupId: preprocessBlank(z.string().nullable().optional()),
});
