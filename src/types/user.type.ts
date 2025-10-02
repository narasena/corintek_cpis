import {  IIMage, ITableHelper } from "./base.dto"
import { EmploymentStatus, UserRole } from '@/features/api/generated/prisma';

export type AllowedUserRole = Exclude<UserRole, 'CLIENT_PIC' | 'CLIENT_MANAGER'>;

export interface TUserCreationAttributes {
  firstName: string;
  lastName: string;
  idNumber?: string | null;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  role: AllowedUserRole;
  employmentStatus: EmploymentStatus;
  avatarImg?: File | null;
}

export interface TUserEditAttributes extends TUserCreationAttributes {
  isActive?: boolean | null;
  isBlocked?: boolean | null;
}

export interface IUser extends Omit<TUserEditAttributes, "avatarImg" | "password" | "confirmPassword">, ITableHelper  {
  avatarUrl?: IIMage['url'];
  avatarPublicId?: IIMage['publicId'];
  role: UserRole;
}
