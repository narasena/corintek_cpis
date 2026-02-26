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

export const ParameterLimitListInputSchema = z.object({
  category: ParameterCategoryEnum.optional(),
  valueType: ValueTypeEnum.optional(),
  isActive: z.boolean().optional(),
});

export const UpdateParameterLimitInputSchema = z.object({
  parameterId: z.string().uuid(),
  minValue: z.number().nullable().optional(),
  maxValue: z.number().nullable().optional(),
  rawWaterMinValue: z.number().nullable().optional(),
  rawWaterMaxValue: z.number().nullable().optional(),
});

export const UpdateParameterLimitBatchInputSchema = z.object({
  items: z.array(UpdateParameterLimitInputSchema),
});

export type TCreateParameter = z.infer<typeof CreateParameterSchema>;
export type TUpdateParameter = z.infer<typeof UpdateParameterSchema>;
export type TParameterLimitListInput = z.infer<
  typeof ParameterLimitListInputSchema
>;
export type TUpdateParameterLimitInput = z.infer<
  typeof UpdateParameterLimitInputSchema
>;
export type TUpdateParameterLimitBatchInput = z.infer<
  typeof UpdateParameterLimitBatchInputSchema
>;

// =============================================================================
// Parameter Interfaces & Contracts
// =============================================================================

export interface IParameter {
  id: string;
  name: string;
  variableName: string;
  category: TParameterCategory;
  valueType: TValueType;
  unit: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  rawWaterMinValue?: number | null;
  rawWaterMaxValue?: number | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface IParameterLimitMasterItem {
  parameterId: string;
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
}

export interface IGetParameterLimitMasterResult {
  parameters: IParameterLimitMasterItem[];
  updatedAt: Date | null;
}

export const UpdateParameterLimitMasterInputSchema = z.object({
  parameterId: z.string().uuid(),
  minValue: z.number().nullable().optional(),
  maxValue: z.number().nullable().optional(),
  rawWaterMinValue: z.number().nullable().optional(),
  rawWaterMaxValue: z.number().nullable().optional(),
});

export const UpdateParameterLimitMasterBatchInputSchema = z.object({
  items: z.array(UpdateParameterLimitMasterInputSchema),
});

export type TUpdateParameterLimitMasterInput = z.infer<
  typeof UpdateParameterLimitMasterInputSchema
>;

export type TUpdateParameterLimitMasterBatchInput = z.infer<
  typeof UpdateParameterLimitMasterBatchInputSchema
>;

export interface IUpdateParameterLimitMasterResult {
  success: boolean;
  updatedIds: string[];
  error?: string;
}
