import { z } from 'zod/v4';
import {
  CreateMachineSchema,
  type TMachineOwnership,
  type TMachineStatus,
  type TMachineType,
} from '@/features/machines/types';

// =============================================================================
// Project Enums
// =============================================================================

export const ProjectStatusEnum = z.enum([
  'PENDING',
  'ONGOING',
  'PAUSED',
  'COMPLETED',
  'CANCELLED',
]);

export type TProjectStatus = z.infer<typeof ProjectStatusEnum>;

// =============================================================================
// Project Validation Schemas
// =============================================================================

export const CreateProjectSchema = z.object({
  clientId: z.string().uuid('Client ID tidak valid'),
  name: z.string().min(1, 'Nama proyek wajib diisi'),
  description: z.string().optional(),
  quoteNumber: z.string().optional(),
  poNumber: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  status: ProjectStatusEnum.default('PENDING'),
  // Machines are optional at project creation
  machines: z
    .array(
      CreateMachineSchema.omit({ projectId: true }).extend({
        id: z.string().optional(),
      })
    )
    .optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  id: z.string().uuid(),
});

export type TCreateProject = z.infer<typeof CreateProjectSchema>;
export type TUpdateProject = z.infer<typeof UpdateProjectSchema>;

// =============================================================================
// Project Interfaces
// =============================================================================

export interface IProject {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  quoteNumber: string | null;
  poNumber: string | null;
  startDate: Date;
  endDate: Date | null;
  status: TProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  client?: { id: string; name: string };
  machines?: Array<{
    id: string;
    unitNumber: number;
    type: TMachineType;
    ownership: TMachineOwnership;
    status: TMachineStatus;
  }>;
}
