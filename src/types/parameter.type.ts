import { parameterSchema } from '@/app/(main)/parameters/schemas/parameterSchema';
import z from 'zod';
import { ITableHelper } from './base.dto';

export type TParameterAttributes = z.infer<typeof parameterSchema>;
export interface IParameter extends TParameterAttributes, ITableHelper {}
