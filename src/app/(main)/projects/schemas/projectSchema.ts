import {
  ContractType,
  ProjectType,
  WorkCategory,
} from '@/features/api/generated/prisma';
import z from 'zod';

export const projectCreationSchema = z.object({
  parentId: z.string().nullable().optional(),
  clientId: z.string().nonempty(),
  name: z.string().nonempty(),
  description: z.string().nullable().optional(),
  quoteNumber: z.string().nonempty(),
  PONumber: z.string().nonempty(),
  startDate: z.union([z.date(), z.string()]).transform(val => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
  endDate: z.union([z.date(), z.string()]).transform(val => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
  type: z.enum(ProjectType),
  contractType: z.enum(ContractType),
  workCategory: z.enum(WorkCategory),
  warranty: z.string().nullable().optional(),
  clientPersonnelIds: z.array(z.string()).min(1),
  personnelIds: z.array(z.string()).min(1),
});
