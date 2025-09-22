import { EmploymentStatus, UserRole } from "@/app/api/generated/prisma";
import z from "zod";

const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string().optional(),
  IDNumber: z.string(),
  email: z.email(),
  phoneNumber: z.string(),
  role: z.enum(UserRole),
  employmentStatus: z.enum(EmploymentStatus),
  avatarUrl: z.string().optional(),
  avatarPublicId: z.string().optional()
})

export default userSchema