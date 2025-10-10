import { parameterSchema } from '@/app/(main)/parameters/schemas/parameterSchema';
import z from 'zod';
import { ITableHelper } from './base.dto';
import { parameterGroupSchema } from '@/app/(main)/parameters/schemas/parameterGroupSchema';

export type TParameterAttributes = z.infer<typeof parameterSchema>;
export interface IParameter extends TParameterAttributes, ITableHelper {}

export type TParameterGroupAttributes = z.infer<typeof parameterGroupSchema>;
export interface IParameterGroup
  extends TParameterGroupAttributes,
    ITableHelper {}
