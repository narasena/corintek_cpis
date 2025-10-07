import { projectCreationSchema } from '@/app/(main)/projects/schemas/projectSchema';
import z from 'zod';
import { ITableHelper } from './base.dto';

export type TProjectCreationAttributes = z.infer<typeof projectCreationSchema>;
export interface IProject extends TProjectCreationAttributes, ITableHelper {}

export type TPersonnelDetail = {
  id: string; // Assuming 'id' is a number
  firstName: string;
  lastName: string;
  // Add any other selected fields here
};

export interface IPersonnelGroup {
  role: string;
  personnels: TPersonnelDetail[];
}
