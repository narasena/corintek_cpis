import z from "zod"
import { ITableHelper } from "./base.dto"
import {userCreationSchema, userEditSchema} from "@/app/(main)/users/schemas/userSchema"

export type TUserCreationAttributes = z.infer<typeof userCreationSchema>
export type TUserEditAttributes = z.infer<typeof userEditSchema>
export interface IUser extends Omit<TUserEditAttributes,"avatarImg"|"password"|"confirmPassword">, ITableHelper  {
  avatarUrl: string
  avatarPublicId: string
}
