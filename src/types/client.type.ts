import { clientCreationSchema } from '@/app/(main)/clients/schemas/clientSchema';
import z from 'zod';
import { IIMage, ITableHelper } from './base.dto';
import { clientPersonnelCreateSchema } from '@/app/(main)/clients/schemas/clientPICSchema';

export type TClientCreationAttributes = z.infer<typeof clientCreationSchema>;

export interface IClient
  extends Omit<TClientCreationAttributes, 'avatarImg'>,
    ITableHelper {
  avatarUrl?: IIMage['url'];
  avatarPublicId?: IIMage['publicId'];
  personnels: IClientPersonnel[];
}

export type TClientPICCreationAttributes = z.infer<
  typeof clientPersonnelCreateSchema
>;

export interface IClientPICDetail
  extends Omit<TClientPICCreationAttributes, 'avatarImg'>,
    ITableHelper {
  avatarUrl?: IIMage['url'];
  avatarPublicId?: IIMage['publicId'];
}

export interface IClientPersonnel extends ITableHelper {
  clientId: string;
  personnelId: string;
  personnel: IClientPICDetail;
}
