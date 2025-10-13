import {
  ContractType,
  ProjectType,
  WorkCategory,
} from '@/features/api/generated/prisma';
import { preprocessBlank } from '@/features/schemas/defaultSchema';
import z from 'zod';

export const projectCreationSchema = z.object({
  parentId: preprocessBlank(z.string().nullable().optional()),
  clientId: z.string().nonempty(),
  name: z.string().nonempty(),
  description: preprocessBlank(z.string().nullable().optional()),
  quoteNumber: z.string().nonempty(),
  PONumber: z.string().nonempty(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(ProjectType),
  contractType: z.enum(ContractType),
  workCategory: z.enum(WorkCategory),
  warranty: preprocessBlank(z.string().nullable().optional()),
  clientPersonnelIds: z.array(z.string()).min(1),
  personnelIds: z.array(z.string()).min(1),
});
