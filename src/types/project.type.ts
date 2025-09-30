import { projectCreationSchema } from "@/app/(main)/projects/schemas/projectSchema";
import z from "zod";
import { ITableHelper } from "./base.dto";

export type TProjectCreationAttributes = z.infer<typeof projectCreationSchema>;
export interface IProject extends TProjectCreationAttributes, ITableHelper {}