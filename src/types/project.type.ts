import { projectCreationSchema } from '@/app/(main)/projects/schemas/projectSchema';
import z from 'zod';
import { ITableHelper } from './base.dto';

export type TProjectCreationAttributes = z.infer<typeof projectCreationSchema>;

export interface IClient {
  id: string;
  name: string;
  // Add other client properties as needed
}

export interface IProject extends TProjectCreationAttributes, ITableHelper {
  client?: IClient;
  assignments?: any[]; // Add assignments if needed
}

export type TPersonnelDetail = {
  id: string; // Assuming 'id' is a number
  firstName: string;
  lastName: string;
  // Add any other selected fields here
};

export interface IPersonnelGroup {
  role: string;
  personnel: TPersonnelDetail[];
}
