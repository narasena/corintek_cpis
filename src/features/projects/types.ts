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

export const ProjectTypeEnum = z.enum(['UTAMA', 'ADDENDUM']);

export type TProjectType = z.infer<typeof ProjectTypeEnum>;

export const ProjectContractTypeEnum = z.enum(['DIRECT', 'SUBCONTRACT']);

export type TProjectContractType = z.infer<typeof ProjectContractTypeEnum>;

export const ProjectWorkCategoryEnum = z.enum([
  'OPERATIONAL',
  'CONSTRUCTION',
  'AD_HOC',
]);

export type TProjectWorkCategory = z.infer<typeof ProjectWorkCategoryEnum>;

export const ProjectAssignmentRoleEnum = z.enum([
  'PROJECT_PIC',
  'TECHNICIAN',
  'CLIENT_PIC',
]);

export type TProjectAssignmentRole = z.infer<typeof ProjectAssignmentRoleEnum>;

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
  projectType: ProjectTypeEnum.default('UTAMA'),
  contractType: ProjectContractTypeEnum.default('DIRECT'),
   workCategory: ProjectWorkCategoryEnum.default('OPERATIONAL'),
  parentProjId: z
    .string()
    .uuid('Project utama tidak valid')
    .optional()
    .nullable(),
  // Machines are optional at project creation
  machines: z
    .array(
      CreateMachineSchema.omit({ projectId: true }).extend({
        id: z.string().optional(),
      })
    )
    .optional(),
});

export const ProjectTypeMetaSchema = CreateProjectSchema.pick({
  projectType: true,
  parentProjId: true,
});

export type TProjectTypeMeta = z.infer<typeof ProjectTypeMetaSchema>;

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
  workCategory: TProjectWorkCategory;
  contractType: TProjectContractType;
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
  parameterOverrides?: Array<{
    id: string;
    parameterId: string;
    minValue: number | null;
    maxValue: number | null;
    rawWaterMinValue: number | null;
    rawWaterMaxValue: number | null;
    parameter?: {
      id: string;
      name: string;
      unit: string | null;
    };
  }>;
}

export interface IProjectDashboardCard {
  id: string;
  name: string;
  quoteNumber: string | null;
  status: TProjectStatus;
  client?: { id: string; name: string };
  myAssignmentRoles: TProjectAssignmentRole[];
  taskCounts: {
    logSheetsPendingApproval: number;
    workReportsPendingApproval: number;
  };
}

export interface IProjectTypeSelectProps {
  value: TProjectType;
  onChange: (value: TProjectType) => void;
  disabled?: boolean;
}

export interface IProjectParentSelectProps {
  projectType: TProjectType;
  clientId: string | null;
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export interface IProjectContractTypeSelectProps {
  value: TProjectContractType;
  onChange: (value: TProjectContractType) => void;
  disabled?: boolean;
}

export interface IProjectWorkCategorySelectProps {
  value: TProjectWorkCategory;
  onChange: (value: TProjectWorkCategory) => void;
  disabled?: boolean;
}

export const ProjectParameterOverrideSchema = z.object({
  id: z.string().uuid().optional(),
  projectId: z.string().uuid('Project ID tidak valid'),
  parameterId: z.string().uuid('Parameter ID tidak valid'),
  minValue: z.number().optional().nullable(),
  maxValue: z.number().optional().nullable(),
  rawWaterMinValue: z.number().optional().nullable(),
  rawWaterMaxValue: z.number().optional().nullable(),
});

export type TProjectParameterOverride = z.infer<
  typeof ProjectParameterOverrideSchema
>;

export const ProjectAssignmentSchema = z.object({
  userId: z.string().uuid('User ID tidak valid'),
  role: ProjectAssignmentRoleEnum,
});

export const SetProjectAssignmentsSchema = z.object({
  projectId: z.string().uuid('Project ID tidak valid'),
  assignments: z.array(ProjectAssignmentSchema),
});

export type TProjectAssignmentInput = z.infer<typeof ProjectAssignmentSchema>;
export type TSetProjectAssignmentsInput = z.infer<
  typeof SetProjectAssignmentsSchema
>;
