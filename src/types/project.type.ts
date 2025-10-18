import { projectCreationSchema } from '@/app/(main)/projects/schemas/projectSchema';
import z from 'zod';
import { ITableHelper } from './base.dto';
import { UserRole } from '@/features/api/generated/prisma';

export type TProjectCreationAttributes = z.infer<typeof projectCreationSchema>;

export interface IClient {
  id: string;
  name: string;
  // Add other client properties as needed
}

export interface IProject
  extends Omit<
      TProjectCreationAttributes,
      'clientPersonnelIds' | 'personnelIds'
    >,
    ITableHelper {
  client: IClient;
  clientPersonnel: IPersonnelGroup[];
  personnel: IPersonnelGroup[]; // Add assignments if needed
}

export interface IPersonnelDetail {
  id: string; // Assuming 'id' is a number
  firstName: string;
  lastName: string | null;
  role: UserRole;
  // Add any other selected fields here
}

export interface IPersonnelGroup {
  role: string;
  personnel: IPersonnelDetail[];
}

export interface IProjectAssignment {
  assignee: IPersonnelDetail;
}
