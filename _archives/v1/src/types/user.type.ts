import { IIMage, ITableHelper } from './base.dto';
import { UserRole } from '@/features/api/generated/prisma/enums';
import z from 'zod';
import { userCreationSchema } from '../app/(main)/users/schemas/userSchema';

export type AllowedUserRole = Exclude<
  UserRole,
  'CLIENT_PIC' | 'CLIENT_MANAGER'
>;

export type TUserCreationAttributes = z.infer<typeof userCreationSchema>;

export interface TUserEditAttributes extends TUserCreationAttributes {
  isActive?: boolean | null;
  isBlocked?: boolean | null;
}

export interface IUser
  extends Omit<
      TUserEditAttributes,
      'avatarImg' | 'password' | 'confirmPassword'
    >,
    ITableHelper {
  avatarUrl?: IIMage['url'];
  avatarPublicId?: IIMage['publicId'];
}
