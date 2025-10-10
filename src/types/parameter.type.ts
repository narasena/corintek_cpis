import { parameterSchema } from '@/app/(main)/parameters/schemas/parameterSchema';
import z from 'zod';
import { ITableHelper } from './base.dto';
import { parameterGroupSchema } from '@/app/(main)/parameters/schemas/parameterGroupSchema';
import { parameterLimitSchema } from '@/app/(main)/parameters/schemas/parameterLimitSchema';
import { standardMethodSchema } from '@/app/(main)/parameters/schemas/standardMethodSchema';

export type TParameterAttributes = z.infer<typeof parameterSchema>;
export interface IParameter extends TParameterAttributes, ITableHelper {}

export type TParameterGroupAttributes = z.infer<typeof parameterGroupSchema>;
export interface IParameterGroup
  extends TParameterGroupAttributes,
    ITableHelper {}

export type TParameterLimitAttributes = z.infer<typeof parameterLimitSchema>;
export interface IParameterLimit
  extends TParameterLimitAttributes,
    ITableHelper {}

export type TStandardMethodAttributes = z.infer<typeof standardMethodSchema>;
export interface IStandardMethod
  extends TStandardMethodAttributes,
    ITableHelper {}
