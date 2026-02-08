import { z } from 'zod/v4';

// =============================================================================
// Parameter Enums
// =============================================================================

export const ValueTypeEnum = z.enum(['NUMBER', 'BOOLEAN', 'TEXT']);
export const ParameterCategoryEnum = z.enum([
  'UNIT_CONDENSOR',
  'UNIT_EVAPORATOR',
  'COOLING_WATER_QUALITY',
  'GENERAL_CONDITION',
  'JOB_DESCRIPTION',
  'CONSUMPTION',
  'LAB_ANALYSIS',
]);

export type TValueType = z.infer<typeof ValueTypeEnum>;
export type TParameterCategory = z.infer<typeof ParameterCategoryEnum>;

// =============================================================================
// Parameter Validation Schemas
// =============================================================================

export const CreateParameterSchema = z.object({
  name: z.string().min(1, 'Nama parameter wajib diisi'),
  variableName: z
    .string()
    .min(1, 'Nama variabel wajib diisi')
    .regex(
      /^[a-z_][a-z0-9_]*$/,
      'Nama variabel hanya boleh huruf kecil, angka, dan underscore'
    ),
  category: ParameterCategoryEnum,
  valueType: ValueTypeEnum,
  unit: z.string().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  rawWaterMinValue: z.number().optional(),
  rawWaterMaxValue: z.number().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const UpdateParameterSchema = CreateParameterSchema.partial().extend({
  id: z.string().uuid(),
});

export type TCreateParameter = z.infer<typeof CreateParameterSchema>;
export type TUpdateParameter = z.infer<typeof UpdateParameterSchema>;

// =============================================================================
// Parameter Interfaces
// =============================================================================

export interface IParameter {
  id: string;
  name: string;
  variableName: string;
  category: TParameterCategory;
  valueType: TValueType;
  unit: string | null;
  minValue: number | null;
  maxValue: number | null;
  rawWaterMinValue: number | null;
  rawWaterMaxValue: number | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
