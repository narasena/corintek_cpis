import { clientCreationSchema } from '@/app/(main)/clients/schemas/clientSchema';
import z from 'zod';
import { IIMage, ITableHelper } from './base.dto';
import { clientPICCreationSchema } from '@/app/(main)/clients/schemas/clientPICSchema';

export type TClientCreationAttributes = z.infer<typeof clientCreationSchema>;

export interface IClient
  extends Omit<TClientCreationAttributes, 'avatarImg'>,
    ITableHelper {
  avatarUrl?: IIMage['url'];
  avatarPublicId?: IIMage['publicId'];
}

export type TClientPICCreationAttributes = z.infer<
  typeof clientPICCreationSchema
>;

export interface IClientPIC
  extends Omit<TClientPICCreationAttributes, 'avatarImg'>,
    ITableHelper {
  avatarUrl?: IIMage['url'];
  avatarPublicId?: IIMage['publicId'];
}
