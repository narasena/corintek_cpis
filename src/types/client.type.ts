import { clientCreationSchema } from '@/app/(main)/clients/schemas/clientSchema';
import z from 'zod';
import { IIMage, ITableHelper } from './base.dto';

export type TClientCreationAttributes = z.infer<typeof clientCreationSchema>;

export interface IClient
  extends Omit<TClientCreationAttributes, 'avatarImg'>,
    ITableHelper {
  avatarUrl?: IIMage['url'];
  avatarPublicId?: IIMage['publicId'];
}
