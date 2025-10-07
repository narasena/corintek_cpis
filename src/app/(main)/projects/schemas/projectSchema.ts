import {
  ContractType,
  ProjectType,
  WorkCategory,
} from '@/features/api/generated/prisma';
import z from 'zod';

export const projectCreationSchema = z.object({
  parentId: z.string().nonempty(),
  clientId: z.string().nonempty(),
  name: z.string().nonempty(),
  description: z.string().nullable().optional(),
  quoteNumber: z.string().nonempty(),
  PONumber: z.string().nonempty(),
  startDate: z.date(),
  endDate: z.date(),
  type: z.enum(ProjectType),
  contractType: z.enum(ContractType),
  workCategory: z.enum(WorkCategory),
  warranty: z.number().nullable().optional(),
  clientPersonnelIds: z.array(z.string()).nonempty(),
  personnelIds: z.array(z.string()).nonempty(),
});
