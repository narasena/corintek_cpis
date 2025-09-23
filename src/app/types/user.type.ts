import z from "zod"
import { ITableHelper } from "./table.helper.type"
import userSchema from "../(main)/users/schemas/userSchema"

type TUserAttributes = z.infer<typeof userSchema>
export interface IUser extends TUserAttributes, ITableHelper {}
