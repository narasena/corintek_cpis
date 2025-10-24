import { MachineOwnership, MachineType } from '@/features/api/generated/prisma';
import { preprocessBlank } from '@/features/schemas/defaultSchema';
import z from 'zod';

export const machineSchema = z.object({
  type: z.enum(MachineType).optional(),
  ownership: z.enum(MachineOwnership),
  capacity: preprocessBlank(z.number().nullable().optional()),
  brand: preprocessBlank(z.string().nullable().optional()),
  model: preprocessBlank(z.string().nullable().optional()),
  serialNumber: preprocessBlank(z.string().nullable().optional()),
  unitNumber: z.number(),
});

export type TMachineAttributes = z.infer<typeof machineSchema>;
