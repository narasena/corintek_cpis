import { EmploymentStatus, UserRole } from "@/app/api/generated/prisma";
import z from "zod";

const userSchema = z.object({
  firstName: z.string("Hanya huruf").nonempty("Wajib diisi").min(3, "Minimal 3 huruf"),
  lastName: z.string().optional(),
  IDNumber: z.string(),
  email: z.email("Format email salah").nonempty("Wajib diisi"),
  password: z.string().nonempty("Wajib diisi"),
  phoneNumber: z.string("Hanya angka").regex(/^[0-9]+$/, "Hanya angka").min(10, "Minimal 10 angka").max(17, "Maksimal 17 angka"),
  role: z.enum(UserRole,"Pilih salah satu"),
  employmentStatus: z.enum(EmploymentStatus,"Pilih salah satu"),
  avatarUrl: z.string().optional(),
  avatarPublicId: z.string().optional(),
  isActive: z.boolean().optional(),
  isBlocked: z.boolean().optional(),
})

export default userSchema