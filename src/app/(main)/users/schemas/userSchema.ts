import { EmploymentStatus, UserRole } from "@/app/api/generated/prisma";
import z from "zod";

const userSchema = z.object({
  firstName: z.string(),
  lastName: z.string().optional(),
  IDNumber: z.string(),
  email: z.email(),
  phoneNumber: z.string(),
  role: z.enum(UserRole),
  employmentStatus: z.enum(EmploymentStatus),
  avatarUrl: z.string().optional(),
  avatarPublicId: z.string().optional(),
  isActive: z.boolean(),
  isBlocked: z.boolean(),
})

export default userSchema