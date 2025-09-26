import z from "zod"
import { ITableHelper } from "./base.dto"
import userSchema from "../(main)/users/schemas/userSchema"

export type TUserAttributes = z.infer<typeof userSchema>
export interface IUser extends TUserAttributes, ITableHelper {}
