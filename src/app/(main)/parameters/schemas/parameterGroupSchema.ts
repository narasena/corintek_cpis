import { ParameterGroupType } from '@/features/api/generated/prisma';
import {
  defaultSchemaMessage,
  preprocessBlank,
} from '@/features/schemas/defaultSchema';
import z from 'zod';

export const parameterGroupSchema = z.object({
  name: z.string().min(1).nonempty(defaultSchemaMessage.nonempty),
  type: z.enum(ParameterGroupType),
  description: preprocessBlank(z.string().nullable().optional()),
});
