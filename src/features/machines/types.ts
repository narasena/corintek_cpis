import { z } from 'zod/v4';

// =============================================================================
// Machine Enums
// =============================================================================

export const MachineTypeEnum = z.enum(['CHILLER', 'COOLING_TOWER']);
export const MachineOwnershipEnum = z.enum(['CORINTEK', 'CLIENT']);
export const MachineStatusEnum = z.enum(['RUNNING', 'IDLE', 'MAINTENANCE']);

export type TMachineType = z.infer<typeof MachineTypeEnum>;
export type TMachineOwnership = z.infer<typeof MachineOwnershipEnum>;
export type TMachineStatus = z.infer<typeof MachineStatusEnum>;

// =============================================================================
// Machine Validation Schemas
// =============================================================================

export const CreateMachineSchema = z.object({
  projectId: z.string().uuid('Project ID tidak valid'),
  unitNumber: z.number().int().min(1, 'Nomor unit wajib diisi'),
  type: MachineTypeEnum,
  ownership: MachineOwnershipEnum.default('CORINTEK'),
  status: MachineStatusEnum.default('IDLE'),
  capacity: z
    .number()
    .positive('Kapasitas harus positif')
    .nullable()
    .optional(),
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  serialNumber: z.string().nullable().optional(),
});

export const UpdateMachineSchema = CreateMachineSchema.partial().extend({
  id: z.string().uuid(),
});

export type TCreateMachine = z.infer<typeof CreateMachineSchema>;
export type TUpdateMachine = z.infer<typeof UpdateMachineSchema>;

// =============================================================================
// Machine Interfaces
// =============================================================================

export interface IMachine {
  id: string;
  projectId: string;
  unitNumber: number;
  type: TMachineType;
  ownership: TMachineOwnership;
  status: TMachineStatus;
  capacity: number | null;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  project?: { id: string; name: string };
}
